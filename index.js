exports.validSetup = function () {
  const fs = require('fs')

  let lastPackageModified = null
  let lastLockfileModified = null
  let lastNpmVersion = null

  async function getStoredInfos () {
    fs.statSync('package.lastSetup')
    const readstream = fs.createReadStream('package.lastSetup', { encoding: 'utf8' })
    const lineReader = require('readline').createInterface({
      input: readstream,
      crlfDelay: Infinity
    })

    const lines = []
    lineReader.on('line', line => { lines.push(line) })

    await require('events').once(lineReader, 'close')

    lastPackageModified = lines[0]
    lastLockfileModified = lines[1]
    lastNpmVersion = lines[2]
  }

  const getPackageModifiedDate = () => {
    try {
      return String(fs.statSync('package.json').mtime.getTime())
    } catch (e) {
      return ''
    }
  }

  const getLockfileModifiedDate = () => {
    try {
      return String(fs.statSync('package-lock.json').mtime.getTime())
    } catch (e) {
      return ''
    }
  }

  const getCurrentNpmVersion = () => {
    return require('child_process').execSync('npm -v').toString().trim()
  }

  function compute () {
    let currentPakcageModified = getPackageModifiedDate()
    let currentLockfileModified = getLockfileModifiedDate()
    let npmVersion = getCurrentNpmVersion()

    if (!currentLockfileModified || !lastPackageModified || (currentPakcageModified !== lastPackageModified)) {
      console.log('Updating ...')
      require('child_process').execSync('npm i', { stdio: 'inherit' })
    } else if (currentLockfileModified !== lastLockfileModified) {
      console.log('Updating ...')
      require('child_process').execSync('npm ci', { stdio: 'inherit' })
    }

    if (!lastNpmVersion || lastNpmVersion !== npmVersion) {
      console.log('Rebuild ...')
      require('child_process').execSync('npm rebuild', { stdio: 'inherit' })
    }

    fs.writeFileSync(
      'package.lastSetup',
      [getPackageModifiedDate(), getLockfileModifiedDate(), npmVersion].join('\n'),
      { encoding: 'utf8' }
    )

    console.log('Your system is up to date')
  }

  return getStoredInfos().catch(() => {}).then(compute)
}
