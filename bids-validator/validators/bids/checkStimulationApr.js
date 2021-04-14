// ADDED (Debora, 2020-11-23)
import utils from '../../utils'
const Issue = utils.issues.Issue

const checkStimulationApr = (fileList) => { // for every bdf there should be one according apr file!
    const issues = []
    const fileKeys = Object.keys(fileList)

    var aprFiles = []
    var stimulationFiles = []

    for (let key of fileKeys) {
        const stimulus = fileList[key]
        if ( fileList[key].name.endsWith(".apr") ) { 
            aprFiles.push(fileList[key].name.replace(".apr","")) 
        } else if ( fileList[key].name.endsWith("_stimulation.tsv") ) { 
            stimulationFiles.push(fileList[key].name.replace("stimulation.tsv","eeg")) // needed to be changed into eeg to compare to other files
        }
    }
    
    if (!utils.array.equals(stimulationFiles, aprFiles)) {
        const evidence = constructMissingAprStimEvidence(
            stimulationFiles,
            aprFiles,
        )
        issues.push(
            new Issue({
                reason: "Not the same number of stimulation files as bdf/bdf.gz files.",
                evidence: evidence,
                file: "undefined",
                code: 1137,                
            }),
        )
        // console.log(issues)
    }
    return issues
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

const constructMissingAprStimEvidence = (stimulationFiles,aprFiles) => {
    
    const diffs = utils.array.diff(stimulationFiles, aprFiles)
    const aprNotInStimFiles = diffs[0]
    const stimNotInAprFiles = diffs[1]
 
    var aprNotInStimulationFiles = []
    for (let stim of aprNotInStimFiles) {
        //console.log(stim)
        aprNotInStimulationFiles.push(stim.replace("eeg","stimulation"))
    }
    
    stimNotInAprFiles.push("")
    aprNotInStimFiles.push("")
    aprNotInStimulationFiles.push("")
   
  if (aprNotInStimulationFiles[0]!=="" && aprNotInStimFiles[0]!==""){ 
    const evidence = "For the following stimulation files there is no corresponding apr file in the dataset:\n                                  " 
                          + aprNotInStimulationFiles.join('.tsv \n                                  ') 
                          + "\n                                  For the following apr files there is no corresponding stimulation.tsv in the dataset:\n                                  " 
                          + stimNotInAprFiles.join('.apr \n                                  ')
      return evidence                    
    } else if (aprNotInStimulationFiles[0]!==""){ 
      const evidence = "For the following stimulation files there is no corresponding apr file in the dataset:\n                                  " 
                            + aprNotInStimulationFiles.join('.tsv \n                                  ')
      return evidence
    } else if (aprNotInStimFiles[0]!==""){
      const evidence = "For the following apr files there is no corresponding stimulation.tsv in the dataset:\n                                  "  
                              + aprNotInStimFiles.join('.apr \n                                  ')
      return evidence
  } 
}

export default checkStimulationApr