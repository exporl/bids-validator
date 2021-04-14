// ADDED (Debora, 2020-09-18)

import utils from '../../utils'
const Issue = utils.issues.Issue

const checkBdfApr = fileList => {
  // for every bdf there should be one according apr file!
  const issues = []
  const fileKeys = Object.keys(fileList)

  var bdfFiles = []
  var aprFiles = []

  for (let key of fileKeys) {
    const stimulus = fileList[key]
    if (fileList[key].name.endsWith('.bdf.gz')) {
      bdfFiles.push(fileList[key].name.replace('.bdf.gz', ''))
    } else if (fileList[key].name.endsWith('.bdf')) {
      bdfFiles.push(fileList[key].name.replace('.bdf', ''))
    } else if (fileList[key].name.endsWith('.apr')) {
      aprFiles.push(fileList[key].name.replace('.apr', ''))
    }
  }
  // console.log( "bdfFiles:" )
  // console.log( bdfFiles )
  // console.log( "aprFiles:" )
  // console.log( aprFiles )

  if (!utils.array.equals(bdfFiles, aprFiles)) {
    const evidence = constructMissingAprBdfEvidence(bdfFiles, aprFiles)
    // console.log(fileList[1].name.replace(".bdf",""))
    issues.push(
      new Issue({
        reason: 'Not the same number of apr as bdf/bdf.gz files.',
        evidence: evidence,
        file: 'undefined',
        code: 1130,
      }),
    )
    // console.log(issues)
  }
  return issues
}

function findWithAttr(array, attr, value) {
  const fileKeys = Object.keys(array)
  for (var i = 0; i < fileKeys.length; i += 1) {
    if (array[i][attr] === value) {
      return i
    }
  }
  return -1
}

const constructMissingAprBdfEvidence = (bdfFiles, aprFiles) => {
  const diffs = utils.array.diff(bdfFiles, aprFiles)
  const aprNotInBdfFiles = diffs[0]
  const bdfNotInAprFiles = diffs[1]
  //   const evidenceOfMissingApr = bdfNotInAprFiles.length
  //     ? '\n                          The following file names were found with extension .bdf (or .bdf.gz) but are missing with extension .apr: \n                             ' +
  //     aprNotInBdfFiles.join(', \n                             ')
  //     : ''
  //   const evidenceOfMissingBdf = aprNotInBdfFiles.length
  //     ? '\n                          The following file names were found with extension .apr but are missing with extension .bdf (or .bdf.gz): \n                             ' +
  //     bdfNotInAprFiles.join(', \n                             ')
  //     : ''
  //   const evidence = evidenceOfMissingApr + evidenceOfMissingBdf
  //   return  evidence
  bdfNotInAprFiles.push('')
  aprNotInBdfFiles.push('')
  //   console.log(bdfNotInAprFiles[0]!=="" && aprNotInBdfFiles[0]!=="")
  //   console.log(aprNotInBdfFiles[0]!=="")
  if (bdfNotInAprFiles[0] !== '' && aprNotInBdfFiles[0] !== '') {
    const evidence =
      'Given that there were bdf/bdf.gz files of the same name, the following files were expected, but not found in the dataset:\n                                  ' +
      aprNotInBdfFiles.join('.apr \n                                  ') +
      '\n                                  Given that there were .apr files of the same name, the following files were expected, but not found in the dataset:\n                                  ' +
      bdfNotInAprFiles.join('.bdf(.gz) \n                                  ')
    return evidence
  } else if (bdfNotInAprFiles[0] !== '') {
    const evidence =
      'Given that there were .apr files of the same name, the following files were expected, but not found in the dataset:\n                                  ' +
      bdfNotInAprFiles.join('.bdf(.gz) \n                                  ')
    return evidence
  } else if (aprNotInBdfFiles[0] !== '') {
    const evidence =
      'Given that there were bdf/bdf.gz files of the same name, the following files were expected, but not found in the dataset:\n                                  ' +
      aprNotInBdfFiles.join('.apr \n                                  ')
    return evidence
  }
}
export default checkBdfApr
