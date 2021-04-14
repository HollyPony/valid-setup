exports.validSetup = function () {
  const fs = require('fs')

  let lastPackageModified = null
  let currentPakcageModified = null
  let lastNpmVersion = null
  let currentNpmVersion = null

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
    lastNpmVersion = lines[1]
  }

  const getPackageModifiedDate = () => {
    currentPakcageModified = String(fs.statSync('package.json').mtime.getTime())
  }

  const getCurrentNpmVersion = () => {
    currentNpmVersion = require('child_process').execSync('npm -v').toString().trim()
  }

  function compute () {
    let updated = false
    if (!lastPackageModified || currentPakcageModified !== lastPackageModified) {
      console.log('Updating ...')
      require('child_process').execSync('npm i', { stdio: 'inherit' })
      currentPakcageModified = String(fs.statSync('package.json').mtime.getTime())
      updated = true
    }

    if (!lastNpmVersion || lastNpmVersion !== currentNpmVersion) {
      console.log('Rebuild ...')
      require('child_process').execSync('npm rebuild', { stdio: 'inherit' })
      updated = true
    }

    if (updated) {
      fs.writeFileSync('package.lastSetup', `${currentPakcageModified}\n${currentNpmVersion}`, { encoding: 'utf8' })
    }

    console.log('Your system is up to date')
  }

  Promise.all([
    getStoredInfos(),
    getPackageModifiedDate(),
    getCurrentNpmVersion(),
  ])
    .catch(err => {})
    .then(() => compute())
}
