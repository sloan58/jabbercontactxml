import { CSVReader } from 'react-papaparse'

function App() {
  // Function to receive the uploaded file
  const uploadFile = (data) => {
    // Remove the headers
    data.shift()

    // Get a list of unique Group names.
    // If the group is empty, assign the 'Contacts' group
    const groups = data
      .map((row) => {
        if (row.data[2] === '') {
          return 'Contacts'
        }
        return row.data[2]
      })
      .filter((row, index, _arr) => _arr.indexOf(row) === index)
      .filter(Boolean)

    // Find rows without a group and set their group as 'Contacts'
    data.forEach((row, index) => {
      if (row.data[2] === '') {
        data[index].data[2] = 'Contacts'
      }
    })

    // Begin XML creation
    let outXml = '<?xml version="1.0" encoding="UTF-8"?><buddylist>'

    // Iterate each group to build the group members
    groups.forEach((group) => {
      // Begin group XML
      outXml = outXml.concat(`<group>`)

      // Begin group name XML
      outXml = outXml.concat(`<gname>${group.trim()}</gname>`)

      // Iterate each contact to check their group membership
      data.forEach((row) => {
        // user@domain (row.data[0]) needs to be present
        // The user's group needs to be the current group in process
        if (row.data[0] !== '' && row.data[2] === group) {
          // Begin user XML
          outXml = outXml.concat('<user>')

          // Set the uname XML (user@domain)
          if (process.env.REACT_APP_STATIC_DOMAIN && row.data[0].trim().split('@').length === 1) {
            // .env exists to hard-code the domain
            outXml = outXml.concat(`<uname>${row.data[0].trim()}@${process.env.REACT_APP_STATIC_DOMAIN}</uname>`)
          } else {
            // No .env exists to hardcode the domain
            outXml = outXml.concat(`<uname>${row.data[0].trim()}</uname>`)
          }

          // If the nickname is set, add the fname XML
          if (row.data[1] !== '') {
            outXml = outXml.concat(`<fname>${row.data[1].trim() || ''}</fname>`)
          }

          // End user XML
          outXml = outXml.concat(`</user>`)
        }
      })

      // End group XML
      outXml = outXml.concat(`</group>`)
    })

    // End buddylist XML
    outXml = outXml.concat('</buddylist>')

    // Provide the output download
    const element = document.createElement('a')
    const file = new Blob([outXml], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = 'jabberContacts.xml'
    document.body.appendChild(element)
    element.click()
  }

  return (
    <>
      <nav className='navbar navbar-light'>
        <a className='navbar-brand' href='/#'>
          <img
            src='/jabber.png'
            width='30'
            height='30'
            className='d-inline-block align-top mx-3'
            alt=''
          />
          Jabber Contacts XML Generator
        </a>
      </nav>
      <div className='container'>
        <div className='card shadow my-4'>
          <div className='card-header bg-white'>
            <h4>What does this app do?</h4>
          </div>
          <div className='card-body'>
            <h5 className='card-title'>
              Converts a CSV contact list into XML format.
            </h5>
            <p className='card-text'>
              When you want to bulk import Jabber contacts into Windows, you
              need to provide an XML file (yuck!). This app will accept a CSV
              file and convert that to the proper XML format for importing into
              Jabber.
            </p>
            <p className='card-text'>
              If you're building from the template file, keep the headers but
              remove row 2 before loading. The only required field to build the
              list is the first one (User ID). The nickname and group name
              are optional.
            </p>
            <p>
              <strong>
                DISCLAIMER: This app does not check or validate your data.
                Garbage in, garbage out!
              </strong>
            </p>
            <div className='d-grid gap-2 d-md-flex justify-content-md-start'>
              <a
                className='btn btn-primary me-md-2'
                href={process.env.PUBLIC_URL + '/jabber_contacts_template.csv'}
                download='jabber_contacts_template.csv'
              >
                Download the Template
              </a>
            </div>
          </div>
        </div>
        <div className='card shadow my-4'>
          <div className='card-header bg-white'>
            <h4>How do I use this app?</h4>
          </div>
          <div className='card-body'>
            <ol className='card-text'>
              <li>Download the template from above</li>
              <li>
                Fill in the details for each column (UserID, Nickname,
                Group)
              </li>
              <li>
                Use the Upload option below to process your contacts CSV file{' '}
                <strong>
                  <u>in the browser</u> (see next section)
                </strong>
              </li>
              <li>
                The app will process and provide you a download of the XML
                equivalent of the source CSV
              </li>
            </ol>
          </div>
        </div>
        <div className='card shadow my-4'>
          <div className='card-header bg-white'>
            <h4>Are you going to steal my data?</h4>
          </div>
          <div className='card-body'>
            <p className='card-text'>
              <strong>No!</strong> This app was built using React.js with all of
              the logic and processing done in your browser. No contact list
              data is sent to a backend server.
            </p>
          </div>
        </div>
        <div className='card shadow my-4'>
          <div className='card-header bg-white'>
            <h4>Upload your CSV</h4>
          </div>
          <div className='card-body'>
            <div className='d-grid gap-2 col-6 mx-auto'>
              <CSVReader
                onDrop={uploadFile}
                style={{}}
                config={{}}
                addRemoveButton
              >
                <span>Drop CSV file here or click to upload.</span>
              </CSVReader>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
