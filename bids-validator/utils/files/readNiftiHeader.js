import nifti from 'nifti-js'
import pako from 'pako'
import fs from 'fs'
import testFile from './testFile'
import Issue from '../../utils/issues'
import isNode from '../isNode'

/**
 * Read Nifti Header
 *
 * Takes a files and returns a json parsed nifti
 * header without reading any extra bytes.
 */
function readNiftiHeader(file, annexed, dir, callback) {
  if (isNode) {
    nodeNiftiTest(file, annexed, dir, callback)
  } else {
    browserNiftiTest(file, callback)
  }
}

function nodeNiftiTest(file, annexed, dir, callback) {
  testFile(file, annexed, dir, function (issue, stats, remoteBuffer) {
    file.stats = stats
    if (issue) {
      callback({ error: issue })
      return
    }
    if (stats) {
      if (stats.size < 348) {
        callback({ error: new Issue({ code: 36, file: file }) })
        return
      }
    }
    if (remoteBuffer) {
      callback(parseNIfTIHeader(remoteBuffer, file))
    } else {
      return extractNiftiFile(file, callback)
    }
  })
}

function extractNiftiFile(file, callback) {
  const bytesRead = 1024
  const buffer = Buffer.alloc(bytesRead)

  fs.open(file.path, 'r', function (err, fd) {
    if (err) {
      callback({ error: new Issue({ code: 44, file: file }) })
      return
    } else {
      fs.read(fd, buffer, 0, bytesRead, 0, function () {
        if (file.name.endsWith('.nii')) {
          callback(parseNIfTIHeader(buffer, file))
        } else {
          try {
            const data = pako.inflate(buffer)
            callback(parseNIfTIHeader(data, file))
          } catch (err) {
            callback(handleGunzipError(buffer, file))
          }
        }
      })
    }
  })
}

async function browserNiftiTest(file, callback) {
  const bytesRead = 1024
  let blob
  if ('slice' in file) {
    // This is a real browser
    blob = file.slice(0, bytesRead)
  } else {
    // Slice is undefined by the Deno adapter, this is likely Deno or a very confused browser
    blob = await file.readBytes(0, bytesRead)
  }
  if (file.size == 0) {
    callback({ error: new Issue({ code: 44, file: file }) })
    return
  }

  // file size is smaller than nifti header size
  if (file.size < 348) {
    callback({ error: new Issue({ code: 36, file: file }) })
    return
  }
  const fileReader = constructBrowserFileReader(file, callback)
  fileReader.readAsArrayBuffer(blob)
}

function constructBrowserFileReader(file, callback) {
  const fileReader = new FileReader()
  fileReader.onloadend = function () {
    const buffer = new Uint8Array(fileReader.result)
    let unzipped

    try {
      unzipped = file.name.endsWith('.nii') ? buffer : pako.inflate(buffer)
    } catch (err) {
      callback(handleGunzipError(buffer, file))
      return
    }

    callback(parseNIfTIHeader(unzipped, file))
  }
  return fileReader
}
/**
 * Parse NIfTI Header (private)
 *
 * Attempts to parse a header buffer with
 * nifti-js and handles errors.
 */
function parseNIfTIHeader(buffer, file) {
  var header
  try {
    header = nifti.parseNIfTIHeader(buffer)
  } catch (err) {
    // file is unreadable
    return { error: new Issue({ code: 26, file: file }) }
  }
  // file was not originally gzipped
  return header
}

/**
 * Handle Gunzip Error (private)
 *
 * Used when unzipping fails. Tests if file was
 * actually gzipped to begin with by trying to parse
 * the original header.
 */
function handleGunzipError(buffer, file) {
  try {
    nifti.parseNIfTIHeader(buffer)
  } catch (err) {
    // file is unreadable
    return { error: new Issue({ code: 26, file: file }) }
  }
  // file was not originally gzipped
  return { error: new Issue({ code: 28, file: file }) }
}

export default readNiftiHeader
