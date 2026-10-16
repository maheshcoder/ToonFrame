import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUILTINS, avatarFrame, avatarExpressionDetails } from '../src/features/avatar/types.ts';
import { expressionsForOccasion } from '../src/features/avatar/occasionExpressions.ts';
import { OCCASIONS } from '../src/features/message/occasions/index.ts';
import { expressionChoices } from '../src/features/avatar/expressionChoices.ts';
import { validateSheetQuality } from '../src/features/avatar/sheetPolicy.ts';
import { poseFingerprint, duplicatePoses } from '../src/features/avatar/imageFingerprint.ts';
import { SheetResources, validateDimensions } from '../src/features/avatar/sheetResource.ts';
import { APP_CONTENT, validateContent } from '../src/features/content/validateContent.ts';
import { pngPixels } from '../scripts/lib/pngPixels.mjs';

test('picker lists physical poses once, including distinct birthday artwork rather than repeated aliases', () => {
  for (const avatar of BUILTINS) {
    const choices = expressionChoices(avatar);
    assert.equal(choices.length,60);
    assert.equal(new Set(choices.map((choice) => choice.id)).size,60);
    assert.equal(choices.filter((choice) => choice.group === 'personal').length,24);
    assert.equal(choices.filter((choice) => choice.group === 'classic').length,24);
    assert.equal(choices.filter((choice) => choice.occasion === 'birthday').length,12);
    const wish = choices.find((choice) => choice.label === 'Make a wish')!;
    const frame = avatarFrame(avatar,wish.mood,'love',wish.artwork);
    assert.ok(frame.url.includes('/birthday/'));
    assert.equal(frame.frame,5);
    assert.equal(avatarExpressionDetails(avatar,wish.mood,'love',wish.artwork).label,'Make a wish');
    const generic = choices.find((choice) => choice.group === 'personal' && choice.mood === 'hopeful')!;
    assert.ok(!avatarFrame(avatar,generic.mood,'birthday',generic.artwork).url.includes('/birthday/'));
  }
});
test('uploaded keyboards show only real frames in their original order', () => {
  for (const layout of ['12','24','48'] as const) {
    const choices = expressionChoices({kind:'upload',id:'custom',name:'Custom',url:'blob:custom',layout});
    assert.equal(choices.length,Number(layout));
    assert.equal(new Set(choices.map((choice) => choice.id)).size,Number(layout));
    assert.ok(choices.every((choice) => !choice.occasion && !choice.artwork));
  }
});
test('explicit pose references cannot draw another character or unknown images', () => {
  const male = BUILTINS[0], foreign = expressionChoices(BUILTINS[1]).find((choice) => choice.occasion)!;
  assert.ok(!avatarFrame(male,'happy','love',foreign.artwork).url.includes('/female/'));
  assert.deepEqual(avatarFrame(male,'happy',undefined,{src:'https://invalid.test/image.png',frame:0}),avatarFrame(male,'happy'));
});
test('fixed sheet ratios, resolution and capacity prevent cramming more poses into one image', () => {
  assert.deepEqual(validateSheetQuality(1024,1536,3,4,true),[]);
  assert.deepEqual(validateSheetQuality(1086,1448,3,4,true),[]);
  assert.ok(validateSheetQuality(1536,2304,6,8,true).some((error) => error.includes('another sheet')));
  assert.ok(validateSheetQuality(1024,1536,4,6,true).some((error) => error.includes('3 × 4')));
  assert.ok(validateSheetQuality(1000,1000,3,4,true).some((error) => error.includes('2:3 or 3:4')));
  assert.ok(validateDimensions({width:1024,height:1536},'48')?.includes('256'));
  assert.equal(validateDimensions({width:768,height:1152},'12'),null);
  assert.equal(validateDimensions({width:1536,height:2304},'48'),null);
  assert.ok(validateDimensions({width:1000,height:1470},'24')?.includes('2:3'));
  assert.ok(validateDimensions({width:6000,height:9000},'48')?.includes('megapixels'));
});
test('content rejects duplicate registrations, overlapping crops, invalid occasion grids and pose metadata', () => {
  const original = APP_CONTENT.sheets.male.at(-1)!;
  const errors = validateContent({...APP_CONTENT,sheets:{male:[original,{...original,columns:4,rows:6,poses:[]}]}});
  assert.ok(errors.some((error) => error.includes('duplicate sheet registration')));
  assert.ok(errors.some((error) => error.includes('maximum 12')));
  assert.ok(errors.some((error) => error.includes('label and emoji')));
  const overlap = validateContent({...APP_CONTENT,sheets:{male:[{...original,frames:Array(12).fill({x:0,y:0,width:.2,height:.2})}]}});
  assert.ok(overlap.some((error) => error.includes('overlap or repeat')));
  // A second pack can use the same semantic mood, with distinct artwork/labels.
  assert.deepEqual(validateContent({...APP_CONTENT,sheets:{male:[original,{...original,src:'/avatars/male/birthday/pack-02.png'}]}}),[]);
});
test('pixel comparison ignores blank margins and detects copied character cells', () => {
  const width = 100, height = 50, data = new Uint8Array(width*height*4).fill(255);
  for (const offset of [0,50]) for (let y=10;y<40;y++) for (let x=10;x<40;x++) {
    const i = (y*width+x+offset)*4;
    data[i]=35; data[i+1]=80; data[i+2]=60;
  }
  const a = poseFingerprint(data,width,height,{x:0,y:0,width:50,height:50});
  const b = poseFingerprint(data,width,height,{x:50,y:0,width:50,height:50});
  assert.ok(a); assert.equal(a,b); assert.deepEqual(duplicatePoses([a,b,null]),[[0,1]]);
  data.fill(255); assert.equal(poseFingerprint(data,width,height,{x:0,y:0,width,height}),null);
});
test('duplicate uploads release the rejected URL, retain valid assets, and allow reuse after removal', async () => {
  let counter = 0; const revoked: string[] = [];
  const resources = new SheetResources(()=>'blob:'+ ++counter,(url)=>revoked.push(url),async()=>({width:1024,height:1536}),async()=>['copied-pose']);
  const file = new File(['image'],'sheet.png',{type:'image/png'});
  assert.equal(await resources.load(file,'12'),'blob:1');
  await assert.rejects(resources.load(file,'12'),/already uploaded/);
  assert.deepEqual(revoked,['blob:2']);
  resources.remove('blob:1');
  assert.equal(await resources.load(file,'12'),'blob:3');
  resources.dispose();
  assert.deepEqual(revoked,['blob:2','blob:1','blob:3']);
});
test('cancellation during pixel inspection cannot add a stale character or leak its URL', async () => {
  let finish!: (value:string[])=>void; const revoked: string[] = [];
  const resources = new SheetResources(()=>'blob:pending',(url)=>revoked.push(url),async()=>({width:1024,height:1536}),()=>new Promise((resolve)=>{finish=resolve;}));
  const pending = resources.load(new File(['image'],'sheet.png',{type:'image/png'}),'12');
  await new Promise((resolve)=>setImmediate(resolve));
  resources.dispose(); finish(['pose']);
  assert.equal(await pending,null); assert.deepEqual(revoked,['blob:pending']);
});
test('local PNG audit decodes real RGB sheets and rejects unsafe or truncated input', () => {
  const bytes = readFileSync(new URL('../public/avatars/female-expressions.png',import.meta.url));
  const image = pngPixels(bytes);
  assert.equal(image.width,1024); assert.equal(image.height,1536);
  assert.equal(image.data.length,1024*1536*4);
  assert.ok(image.data.some((value:number,index:number)=>index%4!==3 && value<50));
  assert.throws(()=>pngPixels(bytes.subarray(0,40)),/Truncated|length|unexpected/i);
  const huge = Buffer.from(bytes); huge.writeUInt32BE(100000,16);
  assert.throws(()=>pngPixels(huge),/megapixels/);
});
test('every occasion has relevant real poses without repeating any physical frame, for built-ins and uploads', () => {
  for (const avatar of [...BUILTINS,{kind:'upload',id:'test',name:'Custom',url:'blob:test',layout:'12'} as const]) {
    for (const occasion of OCCASIONS) {
      const choices = expressionsForOccasion(avatar,occasion.id);
      assert.ok(choices.length > 0,occasion.id);
      assert.equal(new Set(choices.map((choice) => choice.id)).size,choices.length);
      if (avatar.kind === 'builtin' && occasion.id === 'birthday') assert.equal(choices.length,12);
    }
  }
});