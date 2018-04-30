# <kbd>:cloud_with_lightning: @architect/data</kbd>

> Generate a DynamoDB data access layer from an `.arc` file. Automatically disambiguates `testing` (in memory) from deployment `staging` and `production` tables

### Background

An `.arc` file can define `@tables` and `@indexes`. Generated tables follow the format:

- `appname-staging-tablename`
- `appname-production-tablename`

For example, given the following `.arc` file:

```
@app
testapp

@tables
ppl
  pplID *String

cats
  pplID *String
  catID **String

@indexes
ppl
  email *String

cats
  name *String
```

If you've setup your `package.json` per the [quickstart](https://arc.codes/quickstart) then running `npm run create` creates the following tables:

- `testapp-staging-ppl`
- `testapp-production-ppl`
- `testapp-staging-cats`
- `testapp-production-cats`

And running `npm start` will kick up a local Dynalite instance with these tables prepopulated. From here its up to you to connect to the database and interact with the tables on your local machine.

## Connecting to DynamoDB

```javascript
var db = require('@architect/data/db')

db.listTables({}, console.log)
// logs tables
```

> Read the [Testing Guide](https://arc.codes/guides/offline) to learn about working with the local Dynalite instance in your tests

This same code will work in the `staging` and `production` Lambdas without modification.

[Full documentation of the AWS SDK DynamoDB client can be found here.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)

## Working with DocumentClient

The lower level Dynamo client is good for precise database control. Use it for listing, creating, modifying and destroying tables. For working with records `DocumentClient` provides a nicer interface.

```javascript
var doc = require('@architect/data/doc')

doc.put({
  TableName: 'testapp-staging-notes', 
  Item: {
    noteID: 1, 
    body: 'hi'
  }
}, console.log)
// record added to db and logs {noteID:1, body:'hi'}

doc.get({noteID:1}, console.log)
// logs {noteID:1, body:'hi'}
```
DocumentClient has comprehensive support for querying and mutating data.[Full documentation for DocumentClient can be found here.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html)

## Convienance with `@architect/data`

This library bundles the `db` and `doc` connection scripts above. However it does require hard coding `TableName` which might not be desirable. So this module exports a single function for generating a static data access layer client that automatically resolves `TableName` based on `NODE_ENV`.

The client is a plain javscript object keyed by table name with methods from `DyanamoDB.DocumentClient`:

  - `put`
  - `get`
  - `delete`
  - `query`
  - `scan`
  - `update`

## Example Usage

```
@app
testapp

@tables
accounts
  accountID *String

posts
  accountID *String
  postID **String
```

First we generate a client:

```javascript
// reads node_modules/@architect/shared/.arc 
var data = require('@architect/data')
```
The `app` variable above looks like this:

```
{
  account: {put, get, delete, query, scan, update},
  posts: {put, get, delete, query, scan, update}
}
```

You can immediately start using the generated methods:

```javascript
var data = require('@architect/data')

// create a post
app.posts.put({
  accountID: 'fake-id',
  postID: 'fake-post-id',
  title: 'neato'
}, 
function _put(err, result) {
  if (err) throw err
  console.log(result)
})

// read it back
app.posts.get({
  postID: 'fake-post-id'
}, console.log)

// update the record
app.posts.update({
  Key: { 
    postID: 'fake-post-id' 
  },
  UpdateExpression: 'set #title = :title', 
  ExpressionAttributeNames: {
    '#title' : 'title'
  },
  ExpressionAttributeValues: {
    ':title' : 'super neato',
  }
}, console.log)

// destroy it
app.posts.destroy({
  postID: 'fake-post-id'
}, console.log)

```

Check the tests for a detailed example! More docs coming :soon:
