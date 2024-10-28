/* eslint-disable no-unused-vars */

import utils from '../../utils'
const Issue = utils.issues.Issue


export default function(events, stimuli, trigger_stimuli, headers, jsonContents, dir) {
  const issues = []

  // check that all stimuli files present in /stimuli are included in an _events.tsv file
  const stimuliIssues = checkStimuli(stimuli)
  const triggerStimuliIssues = checkTriggerStimuli(trigger_stimuli) // ADDED MARLIES (2021-06-17)

  // check the events file for suspiciously long or short durations
  const designIssues = checkDesignLength(events, headers, jsonContents)

  return [].concat(stimuliIssues, triggerStimuliIssues, designIssues)
}

const checkStimuli = function (stimuli) {
  const issues = []
  const stimuliFromEvents = stimuli.events
  const stimuliFromDirectory = stimuli.directory

  var unusedStimuli_all = []
  var unusedApx_all = []

  if (stimuliFromDirectory) {
    const unusedStimuli = stimuliFromDirectory.filter(function (stimuli) {
      return stimuliFromEvents.indexOf(stimuli.relativePath) < 0
    })
    for (let key of unusedStimuli) {
      const stimulus = unusedStimuli[key]
      if ( !(key.relativePath.endsWith("apx")) && !(key.name.startsWith("t_") || key.name.startsWith("trig_") || key.name.startsWith("trigger_")) ) {  // ADDED (Debora, 2020-09-17) (Marlies 2021-06-16)
        unusedStimuli_all.push(key.name)
      } else { 
        if (key.relativePath.endsWith("apx")) {
          unusedApx_all.push(key.name)                                 
          }  
      }  
    }
  }

  // if there are unused Stimuli => make warning 
  if (!(unusedStimuli_all.length === 0)) {
    issues.push(
      new Issue({
        code: 77,
        evidence: "There are unused stimuli in the stimuli directory, please check whether they are necessary. Unused files: \n                                  "
          + unusedStimuli_all.join('\n                                  '),
        file: "undefined",
      }))
  }

  // if there are unused apx's => make warning
  if (!(unusedApx_all.length === 0)) {
    issues.push(
      new Issue({
        code: 1134,
        evidence: "There are unused apx's in the stimuli directory, please check whether they are necessary. Unused files: \n                                  "
          + unusedApx_all.join('\n                                  '),
        file: "undefined",
      }))
  }

  return issues
}

// ADDED (Marlies 2021-06-16) >>>>>
const checkTriggerStimuli = function(trigger_stimuli) {
  const issues = []
  const triggersFromEvents = trigger_stimuli.events
  const triggersFromDirectory = trigger_stimuli.directory

  var unusedTriggers = []

  if (triggersFromDirectory) {
    const unusedStimuli = triggersFromDirectory.filter(function(trigger_stimuli) {
      return triggersFromEvents.indexOf(trigger_stimuli.relativePath) < 0
    })
    for (let key of unusedStimuli) {
      const stimulus = unusedStimuli[key]
      if ( !(key.relativePath.endsWith("apx")) && (key.name.startsWith("t_") || key.name.startsWith("trig_") || key.name.startsWith("trigger_"))) { 
        unusedTriggers.push(key.name)
      }
    }
  }

  // if there are unused triggers => make warning
  if (!(unusedTriggers.length === 0)) {
    issues.push(
      new Issue({
        code: 1139,
        evidence: "There are unused trigger stimuli in the stimuli directory, please check whether they are necessary. Unused files: \n                                  "
          + unusedTriggers.join('\n                                  '),
        file: "undefined",
      }))
  }

  return issues
}
// <<<<<<<<<

const checkDesignLength = function(events, headers, jsonContents) {
  const issues = []
  // get all headers associated with task data
  const taskHeaders = headers.filter((header) => {
    const file = header[0]
    return file.relativePath.includes('_task-')
  })

  // loop through headers with files that are tasks
  taskHeaders.forEach((taskHeader) => {
    // extract the fourth element of 'dim' field of header - this is the
    // number of volumes that were obtained during scan (numVols)
    const file = taskHeader[0]
    const header = taskHeader[1]
    const dim = header.dim
    const numVols = dim[4]

    // get the json sidecar dictionary associated with that nifti scan
    const potentialSidecars = utils.files.potentialLocations(
      file.relativePath.replace('.gz', '').replace('.nii', '.json'),
    )
    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContents,
    )

    // extract the 'RepetitionTime' field from said sidecar (TR)
    const TR = mergedDictionary.RepetitionTime

    // calculate max reasonable scan time (TR * numVols = longDurationThreshold)
    const longDurationThreshold = Math.floor(TR * numVols)

    // calculate min reasonable scan time (.5 * TR * numVols = shortDurationThreshold)
    const shortDurationThreshold = Math.floor(0.5 * longDurationThreshold)

    // get the _events.tsv associated with this task scan
    const potentialEvents = utils.files.potentialLocations(
      file.relativePath.replace('.gz', '').replace('bold.nii', 'events.tsv'),
    )
    const associatedEvents = events.filter(
      (event) => potentialEvents.indexOf(event.path) > -1,
    )

    // loop through all events associated with this task scan
    for (let event of associatedEvents) {
      // get all non-empty rows
      const rows = event.contents
        .split('\n')
        .filter((row) => !(!row || /^\s*$/.test(row)))

      // get the 'onset' field of the last event (lastEventOnset)
      const lastEventOnset = rows[rows.length - 1].trim().split('\t')[0]

      // check if lastEventOnset > longDurationThreshold - append issue if so
      if (lastEventOnset > longDurationThreshold) {
        issues.push(
          new Issue({
            file: event.file,
            code: 85,
          }),
        )
      }

      // check if the lastEventOnset < shortDurationThreshold - append issue if so
      if (lastEventOnset < shortDurationThreshold) {
        issues.push(
          new Issue({
            file: event.file,
            code: 86,
          }),
        )
      }
    }
  })
  return issues
}
