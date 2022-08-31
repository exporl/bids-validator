// ADDED (Marlies, 2021-10-13)
import utils from '../../utils'
const Issue = utils.issues.Issue

const checkCoordinateElectrode = (fileList) => { // for every electrode file there should be coordinates file 
    const issues = []
    const fileKeys = Object.keys(fileList)

    var electrodeFiles = []
    var coordinateFiles = []

    for (let key of fileKeys) {
        const stimulus = fileList[key]

        if ( fileList[key].name.endsWith("_electrodes.tsv") ) { 
            electrodeFiles.push(fileList[key].name.replace("_electrodes.tsv","")) 
        } else if ( fileList[key].name.endsWith("_coordsystem.json") ) { 
            coordinateFiles.push(fileList[key].name.replace("_coordsystem.json",""))
        }
    }

    // electrodes Files and coordinate Files should be exactly the same
    if (!utils.array.equals(electrodeFiles, coordinateFiles, true)) {
        
        const evidence = constructMissingCoordinateElectrodeEvidence(
            electrodeFiles,
            coordinateFiles,
        )
        console.log(evidence)
        issues.push(
            new Issue({
                reason: "Not the same number of electrode files as coordinate files. Each electrode file must have a coordinate file to add more information regarding the fiducials.",
                evidence: evidence,
                file: "undefined",
                code: 1142,                
            }),
        )
    }
    return issues
}

const constructMissingCoordinateElectrodeEvidence = (electrodeFiles, coordinateFiles) => {
    
    const diffs = utils.array.diff(electrodeFiles, coordinateFiles)
    const electrodesNotInCoordFiles = diffs[0]
    const coordNotInElectrodeFiles = diffs[1]
    
    electrodesNotInCoordFiles.push("")
    coordNotInElectrodeFiles.push("")

  if (electrodesNotInCoordFiles[0]!=="" && coordNotInElectrodeFiles[0]!==""){ 
    const evidence = "For the following coordinate files there is no corresponding electrode file in the dataset:\n                                  " 
                          + coordNotInElectrodeFiles.join('_coordsystem.json.tsv                                  \n') 
                          + "\n For the following electrode files there is no corresponding coordinate file in the dataset:\n                                  " 
                          + electrodesNotInCoordFiles.join('_electrodes.tsv \n                                  ')
      return evidence                    
    } else if (coordNotInElectrodeFiles[0]!==""){ 
      const evidence = "For the following coordinate files there is no corresponding electrode file in the dataset:\n                                  " 
                        + coordNotInElectrodeFiles.join('_coordsystem.json \n                                  ') 
      return evidence
    } else if (electrodesNotInCoordFiles[0]!==""){
      const evidence = "For the following electrode files there is no corresponding coordinate file in the dataset:\n                                  " 
      + electrodesNotInCoordFiles.join('_electrodes.tsv \n                                  ')
      return evidence
  } 
}

export default checkCoordinateElectrode