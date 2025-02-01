Please provide a footnote in JSON format that includes the following details:

- Authors: A list of authors with their last names and initials.
- Year: The year of publication.
- Title: The title of the publication.
- URL: The URL where the publication can be accessed.
- Journal (optional): The journal details including name, volume, and pages.

CONSTRAINTS:

- Ensure the URL is a valid URL.
- IF the URL is not provided, use a empty string.

The JSON should conform to the following TypeScript interface:

```typescript
export interface Author {
  lastName: string;
  initials: string;
}

export interface Journal {
  name?: string;
  volume?: string;
  pages?: string;
}

export interface Footnote {
  authors: Author[];
  year: number;
  title: string;
  url: string;
  journal?: Journal;
}
```

Example JSON:

```json
{
  "authors": [
    {
      "lastName": "Doe",
      "initials": "J.D."
    },
    {
      "lastName": "Smith",
      "initials": "A.B."
    }
  ],
  "year": 2021,
  "title": "An Example Publication",
  "journal": {
    "name": "Example Journal",
    "volume": "10",
    "pages": "100-110"
  }
}
```

INPUT:
{{input}}

OUTPUT:
