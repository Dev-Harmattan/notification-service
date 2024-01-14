import * as fse from 'fs-extra';

// Copy the 'src/emails' directory to 'build/src/emails'
fse.copySync('src/emails', 'build/src/emails');
