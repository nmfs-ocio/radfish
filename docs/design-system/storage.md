---
sidebar_position: 2
---

# Storage

The RADFish storage system provides a robust and flexible solution for managing data in your applications. It's designed to work seamlessly with offline-first applications, providing a consistent API for storing and retrieving data from device storage.

## Overview

The storage system is built around several key components that work together:

1. **Connector** - Connects to a specific storage backend (e.g., IndexedDB).
2. **Schema** - Defines the structure and validation rules for your data.
3. **Store** - Manages collections and provides access to data.
4. **Collection** - Handles CRUD operations for a specific type of data.

## Setting Up Storage in an Application

The most common way to set up storage in a RADFish application is through the `Application` constructor. This approach automatically handles connecting to the storage backend and setting up collections.

```jsx
import { Application } from "@nmfs-ocio/radfish";
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";

const app = new Application({
  stores: {
    weatherSurvey: {
      connector: new IndexedDBConnector("weather-survey-app"),
      collections: {
        Form: {
          schema: {
            fields: {
              id: {
                type: "string",
                primaryKey: true,
              },
              surveyDate: {
                type: "string",
                required: true,
              },
              submittedBy: {
                type: "string",
                required: true,
              },
              submittedAt: {
                type: "timestamp",
              },
              status: {
                type: "string",
                required: true,
              },
            },
          },
        },
      },
    },
  }
});
```

## Key Components

### Connector

A Connector is responsible for connecting to a specific storage backend and providing an interface for collections to interact with that backend.

RADFish provides two built-in connectors:

1. **IndexedDBConnector** - Uses IndexedDB for storage (recommended for most applications)
2. **LocalStorageConnector** - Uses localStorage for storage (limited capacity, but simpler)

```jsx
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";

const connector = new IndexedDBConnector("weather-survey-app");
```

### Schema

A Schema defines the structure and validation rules for a collection of data. It defines all the fields, their types, and constraints for a particular type of data.

```jsx
const formSchema = {
  fields: {
    id: {
      type: "string",
      primaryKey: true,
    },
    surveyDate: {
      type: "string",
      required: true,
    },
    submittedBy: {
      type: "string",
      required: true,
    },
    submittedAt: {
      type: "timestamp",
    },
    // ... other fields
  },
};
```

#### Schema Field Properties

| Property     | Type    | Description                                               |
| ------------ | ------- | --------------------------------------------------------- |
| `type`       | string  | The data type of the field (see supported types below)    |
| `required`   | boolean | Indicates if the field is required                        |
| `primaryKey` | boolean | Marks the field as the primary key for the collection     |
| `default`    | any     | Default value for the field if not provided               |
| `minLength`  | number  | Minimum length for string fields                          |
| `minimum`    | number  | Minimum value for number fields                           |
| `maximum`    | number  | Maximum value for number fields                           |
| `pattern`    | RegExp  | Regular expression pattern for string validation          |
| `unique`     | boolean | Indicates if the field value must be unique in collection |

#### Supported Data Types

The Schema system supports the following data types:

| Type             | Description                           | Valid Values                                             |
| ---------------- | ------------------------------------- | -------------------------------------------------------- |
| `string`         | Text values                           | Any string                                               |
| `number`         | Numeric values (integers or decimals) | Any number                                               |
| `boolean`        | Boolean values                        | `true` or `false`                                        |
| `timestamp`      | Date and time values with timezone    | Date object or ISO string (e.g., `2025-05-16T14:23:00Z`) |
| `date`           | Date values (without time)            | Date object or ISO date string (e.g., `2025-05-16`)      |
| `time`           | Time values (without date)            | String in 24-hour format (e.g., `14:23:00`)              |
| `datetime-local` | Date and time values without timezone | Date object or ISO string (e.g., `2025-05-16T14:23:00`)  |

#### Schema Validation

The Schema class provides a `validate` method to validate data against the schema rules. It can be used to check if data is valid before attempting to save it to a collection.

```jsx
// Get a collection's schema
const schema = formCollection.schema;

// Data to validate
const data = {
  surveyDate: "2025-05-16",
  submittedBy: "John Smith",
  status: "draft",
};

// Validate data (non-strict mode)
const validation = schema.validate(data);

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  // Example output: [{field: "id", error: "Field is required"}]
} else {
  // Data is valid
  await formCollection.create(data);
}
```

The `validate` method returns an object with two properties:
- `isValid` (boolean): Indicates if the data is valid
- `errors` (array): List of validation error objects if any

Each error object in the errors array has the following format:
- `field` (string): The name of the field that failed validation
- `error` (string): A description of the validation error

##### Strict Mode Validation

You can also use strict mode, which throws a ValidationError instead of returning an error object:

```jsx
try {
  // Passing 'true' as the second parameter enables strict mode
  schema.validate(data, true);
  
  // If validation passes, create the record
  await formCollection.create(data);
} catch (error) {
  if (error.name === "ValidationError") {
    console.error("Validation errors:", error.errors);
    // Handle validation errors
  } else {
    // Handle other errors
    console.error("Error:", error.message);
  }
}
```

### Store

A Store manages collections for a specific domain of your application. Each store has a connector and can have multiple collections.

```jsx
import { Store } from "@nmfs-ocio/radfish/storage";

const store = new Store({
  name: "weatherSurvey",
  connector: connector
});
```

### Collection

A Collection provides methods for creating, reading, updating, and deleting data for a specific schema. Collections validate data against their schema before performing any operations.

```jsx
// Get a collection from the Application
const formCollection = app.stores.weatherSurvey.getCollection("Form");

// Create a new form
const newForm = await formCollection.create({
  surveyDate: "2025-05-16",
  submittedBy: "John Smith",
  status: "draft"
});

// Find forms
const draftForms = await formCollection.find({ status: "draft" });

// Update a form
const updatedForm = await formCollection.update({
  id: newForm.id,
  status: "submitted",
  submittedAt: new Date().toISOString()
});

// Delete a form
await formCollection.delete({ id: newForm.id });
```

## Working with Collections

### Creating Records

To create a new record, call the `create` method on a collection:

```jsx
const newForm = await formCollection.create({
  surveyDate: "2025-05-16",
  submittedBy: "John Smith",
  status: "draft"
});

console.log("Created form with ID:", newForm.id);
```

### Finding Records

To retrieve records from a collection, use the `find` method:

```jsx
// Find all draft forms
const draftForms = await formCollection.find({ status: "draft" });

// Find a specific form by ID
const form = await formCollection.find({ id: "form-123" });
```

### Updating Records

To update a record, use the `update` method:

```jsx
const updatedForm = await formCollection.update({
  id: "form-123",
  status: "submitted",
  submittedAt: new Date().toISOString()
});
```

### Deleting Records

To delete records, use the `delete` method:

```jsx
// Delete a specific form
await formCollection.delete({ id: "form-123" });

// Delete all draft forms
await formCollection.delete({ status: "draft" });
```

## Event Handling

The storage system emits events during various operations, allowing you to hook into the lifecycle of data operations.

```jsx
// Listen for events at the collection level
formCollection.addEventListener('beforeCreate', (event) => {
  // Add defaults if needed
  if (!event.detail.data.status) {
    event.detail.data.status = "draft";
  }
  
  console.log('About to create form:', event.detail.data);
});

formCollection.addEventListener('create', (event) => {
  console.log('Form created:', event.detail.data);
});

// Listen for events at the connector level (across all collections)
connector.addEventListener('create', (event) => {
  console.log(`Created record in ${event.detail.schema.name}:`, event.detail.data);
});
```

## Best Practices

1. **Define Clear Schemas**: Well-defined schemas ensure data integrity and make your application more maintainable.

2. **Use IndexedDB for Larger Applications**: IndexedDB provides more storage space and better performance than LocalStorage.

3. **Handle Offline Scenarios**: Implement sync strategies to handle data that needs to be synchronized with a server when connectivity is restored.

4. **Use Events for Side Effects**: Use event listeners for logging, caching, and other side effects in response to changes to your data.

5. **Validate User Input**: While collections validate data against schemas, it's still good practice to validate user input before calling collection methods.

## Example: Complete Weather Survey Application

Here's an example of how to set up a complete weather survey application with forms:

```jsx
import { Application } from "@nmfs-ocio/radfish";
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";

// Initialize the application with storage
const app = new Application({
  stores: {
    weatherSurvey: {
      connector: new IndexedDBConnector("weather-survey-app"),
      collections: {
        Form: {
          schema: {
            fields: {
              id: {
                type: "string",
                primaryKey: true,
              },
              surveyDate: {
                type: "string",
                required: true,
              },
              submittedBy: {
                type: "string",
                required: true,
              },
              submittedAt: {
                type: "timestamp",
              },
              status: {
                type: "string",
                required: true,
              },
            },
          },
        },
      },
    },
  }
});

// When the application is ready
app.on("ready", async () => {
  // Get collections
  const formCollection = app.stores.weatherSurvey.getCollection("Form");
  
  // Create a new form
  const newForm = await formCollection.create({
    surveyDate: "2025-05-16",
    submittedBy: "John Smith",
    status: "draft"
  });
  
  // Mark the form as submitted
  await formCollection.update({
    id: newForm.id,
    status: "submitted",
    submittedAt: new Date().toISOString()
  });
});
```

By following these patterns, you can create powerful applications that work seamlessly online and offline, providing a consistent user experience regardless of network conditions.
