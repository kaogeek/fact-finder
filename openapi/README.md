# OpenAPI and Mock Servers
We utilize [OpenAPI Specification v3.0](https://swagger.io/specification/) and [Prism by Stoplight](https://github.com/stoplightio/prism). These tools help us design API contract as a code, getting mock server running, and generate easy to understand API document.

## How to start mock server
1. Install Prism
```
yarn global add @stoplight/prism-cli
```
2. Run below command in this directory
```
prism mock openapi/api.yaml
```
3. Try access one of our API in browser, for example,  http://127.0.0.1:4010/events. You should see list of sample events from mock api.
