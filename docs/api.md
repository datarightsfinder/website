# API

Open Data Rights provides a simple, read-only API so developers can easily use the data from this website in their own applications.

## Root URL

The API is available at:

```
https://opendatarights.projectsbyif.com/api/1/
```

## Endpoints

### `GET /all`

Returns an array of all organisations on Open Data Rights

### `GET /search/{query}`

Returns any search results for `{query}`

### `GET /organisations/{registration country}/{registration number}`

Returns information about a single organisation.

`{registration country}` is an [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code representing the registration country of an organisation. `{registration number}` is the number used to identify that organisation within that country. This information can be found on [OpenCorporates](https://opencorporates.com).
