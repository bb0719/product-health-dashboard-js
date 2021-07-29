const csvToJSON = (csv) => {
  let lines = csv.split("\n") //split on new lines
  const result = []
  if (!lines | lines.length == 0) {
    return [] // if we dont have anything return empty array
  }
  const headers = lines[0].split(","); // get headers from first line
  for (let i = 1; i < lines.length; i++) {
    let obj = {}
    if (lines[i] == undefined || lines[i].trim() == "") {
      continue; // if the lines is empty skip it
    }
    let words = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // split on comma to get each entry
    // this just uses a regex to attempt to exclude commas that occur between quotes
    for (let j = 0; j < words.length; j++) {
      let word = words[j]
      if (Number(word)) {
        word = Number(word) //convert to number if we can
      }
      obj[headers[j].trim()] = word; // make object by looking up the position in the headers
    }
    result.push(obj)
  }
  return result
}

export default csvToJSON
