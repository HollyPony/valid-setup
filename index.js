const fs = require('fs')
const crypto = require('crypto')

const lockfileName = 'package.lock'

const npmVersion = require('child_process').execSync('npm -v').toString().trim()

function validSetup () {
  const lock = readLockfile()

  let pakcageChecksum = getChecksum('package.json')
  let lockfileChecksum = getChecksum('package-lock.json')

  if (!lockfileChecksum || pakcageChecksum !== lock.packageChecksum) {
    console.log('Updating ...')
    require('child_process').execSync(`npm install`, { stdio: 'inherit' })

    const newLockfileChecksum = getChecksum('package-lock.json')
    if (lockfileChecksum === newLockfileChecksum) {
      require('child_process').execSync(`npm ci`, { stdio: 'inherit' })
    }
  } else if (lockfileChecksum !== lock.lockfileChecksum) {
    console.log('Updating ...')
    require('child_process').execSync(`npm ci`, { stdio: 'inherit' })
  }

  if (!lock.npmVersion || lock.npmVersion !== npmVersion) {
    console.log('Rebuild ...')
    require('child_process').execSync('npm rebuild', { stdio: 'inherit' })
  }

  persistLockfile()

  console.log('Your system is up to date')
}

function getChecksum(file, algorithm, encoding) {
  try {
    const str = fs.readFileSync(file, { encoding: 'utf8' })
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
  } catch (e) { return '' }
}

function readLockfile () {
  try {
    const lines = fs.readFileSync(lockfileName, { encoding: 'utf8' }).split('\n')

    return {
      packageChecksum: lines[0],
      lockfileChecksum: lines[1],
      npmVersion: lines[2],
    }
  } catch (e) { return {} }
}

function persistLockfile () {
  return fs.writeFileSync(lockfileName,
    [
      getChecksum('package.json'),
      getChecksum('package-lock.json'),
      npmVersion,
    ].join('\n'),
    { encoding: 'utf8' }
  )
}

exports.validSetup = validSetup
