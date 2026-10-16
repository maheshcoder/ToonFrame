export async function chooseOccasion(page, id) {
  await page.locator('[data-occasion="' + id + '"]').click();
}
export async function chooseExpression(page, sceneNumber, mood, occasion) {
  await page.getByRole('button', { name: 'Expression for scene ' + sceneNumber, exact: true }).click();
  const dialog = page.getByRole('dialog');
  if (occasion) {
    await dialog.getByRole('button', { name: 'Occasions', exact: true }).click();
    await dialog.locator('[data-expression-occasion="' + occasion + '"]').click();
  }
  await dialog.locator('.expression-option[data-source="' + (occasion ? 'occasion' : 'generic') + '"][data-mood="' + mood + '"]').click();
}
// Clear, distinct synthetic poses for browser validation; not shipped as avatar artwork.
export async function makeTestSheet(page, width, height, mime = 'image/png', layout = '48', mode = 'unique') {
  const data = await page.evaluate(({ width, height, mime, layout, mode }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,width,height);
    const columns = layout === '12' ? 3 : layout === '24' ? 4 : 6, rows = layout === '12' ? 4 : layout === '24' ? 6 : 8;
    const cw = width/columns, ch = height/rows;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      if (mode === 'blank' && row === 0 && col === 0) continue;
      const pose = mode === 'duplicate' ? 0 : row*columns+col;
      const x = (col+.5)*cw, y = (row+.38)*ch;
      ctx.fillStyle = 'hsl(' + (pose*47 + Number(layout)*3) % 360 + ', 46%, 57%)';
      ctx.beginPath(); ctx.arc(x,y,cw*.26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#324939'; ctx.fillRect(x-cw*.25,y+ch*.26,cw*.5,ch*.25);
      ctx.fillStyle = '#182316'; ctx.fillRect(x-cw*.14,y-ch*.04,cw*.05,ch*.04); ctx.fillRect(x+cw*.09,y-ch*.04,cw*.05,ch*.04);
      ctx.fillRect(x-cw*.12,y+ch*.09,cw*(.08+(pose%6)*.035),ch*(.015+(pose%4)*.008));
    }
    return canvas.toDataURL(mime).split(',')[1];
  }, { width, height, mime, layout, mode });
  return Buffer.from(data, 'base64');
}