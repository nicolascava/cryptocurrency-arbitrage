import fs from 'fs';

import { filePath } from '../config/Base';

export default function () {
  const baseFile = JSON.parse(fs.readFileSync(filePath));

  if (!baseFile.start) {
    baseFile.start = Date.now();
    fs.writeFileSync(filePath, JSON.stringify(baseFile));
  }
}
