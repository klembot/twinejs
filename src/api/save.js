
// TODO: Update docs, and code to mimic flow in ../file/save.js

function postData(url = '', data = {}) {
  console.log('fetch request', data);

  // Default options are marked with *
  return fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
          'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  .then(response => response.json()); // parses JSON response into native Javascript objects
}

function getData(url = '') {
  // Default options are marked with *
  return fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
          'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      // body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  .then(response => response.json()); // parses JSON response into native Javascript objects
}

const loadArchive = (archive, filename, success, failure) => {
  console.log('hi');
}

const saveArchive = (archive, filename, success, failure) => {
	const data = {
		answer: 42, // This is totally arbitrary, and should really be something meaningful like "user"
		archive
	};

	// Example POST method implementation:
	const baseUrl = `http://localhost:3000`;
	const url = `${baseUrl}/archive`;
	// const url = `${baseUrl}/twine/api/v1/archive/${archiveID}`;
	postData(url, data)
		.then(data => {
      // console.log(JSON.stringify(data), data)

      if (data.status === 'ACK') {
        console.log('All good..')
        if (data.changes.local) {
          console.log('Local changes were saved..');
        }
  
        if (data.changes.remote) {
          console.log('Found uptream changes, how do I import the new file?')
        }  
      } else {
        console.log('Error saving changes..');
        // Force file to be saved locally?
      }

    }) // JSON-string from `response.json()` call
		.catch(error => console.error(error));
};

module.exports = {
  loadArchive,
  saveArchive,
}
