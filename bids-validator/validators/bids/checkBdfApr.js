// ADDED (Debora, 2020-09-18)

import utils from '../../utils'
const Issue = utils.issues.Issue

const checkBdfApr = (fileList) => { // for every bdf there should be one according apr file!
    const issues = []
    const fileKeys = Object.keys(fileList)

    var bdfFiles = []
    var aprFiles = []
    //var aprFilesInparts = [] // ADDED 2021-04-27 : NOW POSSIBLE TO HAVE SEVERAL APRs FOR ONE BDF 
    //var bdfFilesInparts = [] // ADDED 2021-04-27 : NOW POSSIBLE TO HAVE SEVERAL APRs FOR ONE BDF

    for (let key of fileKeys) {
        const stimulus = fileList[key]
        
        //if ( fileList[key].name.match(/eeg-inparts.bdf$/) ) {                                       // ADDED 2021-04-27
        //    //console.log( fileList[key].name.substring(0, fileList[key].name.length - 12))           // 
        //    bdfFilesInparts.push( fileList[key].name.substring(0,fileList[key].name.length-12))     // cuts off the last 12 characters, which should be "-inparts.bdf"
        //} else if ( fileList[key].name.match(/eeg-inparts.bdf.gz$/) ) {                             // 
        //    //console.log( fileList[key].name.substring(0, fileList[key].name.length -15) )           // 
        //    bdfFilesInparts.push( fileList[key].name.substring(0,fileList[key].name.length-15))     // cuts off the last 15 characters, which should be "-inparts.bdf.gz"
        //} else if ( fileList[key].name.endsWith(".bdf.gz") ) {
            if ( fileList[key].name.endsWith(".bdf.gz") ) { 
            bdfFiles.push(fileList[key].name.replace(".bdf.gz",""))
        } else if ( fileList[key].name.endsWith(".bdf") ) { 
            bdfFiles.push(fileList[key].name.replace(".bdf",""))
        } else if ( fileList[key].name.match(/eeg-[a-z].apr$/) ) {                                  // ADDED 2021-04-27
            //console.log( fileList[key].name.substring(0, fileList[key].name.length - 6) )           //
            //aprFilesInparts.push( fileList[key].name.substring(0,fileList[key].name.length-6))      // cuts off the last 6 characters, which should be "-X.apr" with X any letter of the alphabet
            aprFiles.push( fileList[key].name.substring(0,fileList[key].name.length-6))      // cuts off the last 6 characters, which should be "-X.apr" with X any letter of the alphabet
        } else if ( fileList[key].name.endsWith(".apr") ) { 
            aprFiles.push(fileList[key].name.replace(".apr","")) 
        } 
    }
    // console.log( "bdfFiles:" )
    // console.log( bdfFiles )
    // console.log( "aprFiles:" )
    // console.log( aprFiles )

    //console.log(aprFiles)
    aprFiles = aprFiles.filter(onlyUnique) // ADDED 2021-04-27
 
    //console.log(aprFiles)



    // CHECK NORMAL APR AND BDF FILES:
    if (!utils.array.equals(bdfFiles, aprFiles, true)) {   // true includes sorting of arrays
        const evidence = constructMissingAprBdfEvidence(
            bdfFiles,
            aprFiles,
        )
        // console.log(fileList[1].name.replace(".bdf",""))
        issues.push(
            new Issue({
                reason: "Not the same number of apr groups as bdf/bdf.gz files. Apr files with the same prefix and ending with 'eeg*.apr' are counted as one group.",
                evidence: evidence,
                file: "undefined",
                code: 1130,                
            }),
        )
        // console.log(issues)
    }

    // CHECK APR AND BDF FILES THAT ARE SPLITTED IN PARTS
    // todo if we want this indicated in the eeg files...

    return issues
}

function onlyUnique(value, index, self) { // ADDED 2021-04-27
    return self.indexOf(value) === index;
}

function findWithAttr(array, attr, value) {
    const fileKeys = Object.keys(array)
    for(var i = 0; i < fileKeys.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}



const constructMissingAprBdfEvidence = (bdfFiles,aprFiles) => {
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
  bdfNotInAprFiles.push("")
  aprNotInBdfFiles.push("")
//   console.log(bdfNotInAprFiles[0]!=="" && aprNotInBdfFiles[0]!=="")
//   console.log(aprNotInBdfFiles[0]!=="") 
if (bdfNotInAprFiles[0]!=="" && aprNotInBdfFiles[0]!==""){ 
  const evidence = "Given that there were bdf/bdf.gz files of the same name, the following apr files (or group of apr files) were expected, but not found in the dataset:\n                                  " 
  + aprNotInBdfFiles.join('*.apr \n                                  ') 
  + "\n                                  Given that there were .apr files (or group of apr files) of the same name, the following bdf/bdf.gz files were expected, but not found in the dataset:\n                                  " 
  + bdfNotInAprFiles.join('.bdf(.gz) \n                                  ')
return evidence                    
} else if (bdfNotInAprFiles[0]!==""){ 
const evidence = "Given that there were .apr files (or group of apr files) of the same name, the following bdf/bdf.gz files were expected, but not found in the dataset:\n                                  " 
    + bdfNotInAprFiles.join('.bdf(.gz) \n                                  ')
return evidence
} else if (aprNotInBdfFiles[0]!==""){
const evidence = "Given that there were bdf/bdf.gz files of the same name, the following apr files (or group of apr files) were expected, but not found in the dataset:\n                                  "  
      + aprNotInBdfFiles.join('*.apr \n                                  ')
return evidence
}
}
export default checkBdfApr
