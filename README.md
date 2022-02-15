# RISKEN WEB

![Build Status](https://codebuild.ap-northeast-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiSGFTQW9qYjVaeWhlRDAwVzlOV2lWRzhGbzVGSkNkWXpRVHhPYlR0V2s2WlF5eTNONGIvOVFwWEwxNnRQWk95dDZONW1jeUI0Z1NhUDEwYmllWjE2SWc0PSIsIml2UGFyYW1ldGVyU3BlYyI6Im5DQjg3bXFtcDhlVkk3eVgiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

`RISKEN` is a monitoring tool for your cloud platforms, web-site, source-code... 
`RISKEN WEB` is the WEB front-end of the system.

Please check [RISKEN Documentation](https://docs.security-hub.jp/).

## Installation

### Requirements

This module requires the following modules:

- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

### Install packages

This module is developed in the `Go language`, please run the following command after installing the `Go`.

```bash
$ make install
```

### Building

Build the containers on your machine with the following command

```bash
$ make build
```

### Running Apps

There are 2 ways to deploy to two different environments.
- On local web server
- On kubernetes service

#### Local

- Build & deploy web contents on your local web-server with the following command:
```bash
$ make run
```

- You can access `http://localhost:8080/` on your browser.

#### Kubernetes

Deploy the pre-built containers to the Kubernetes environment on your local machine.

- Follow the [documentation](https://docs.security-hub.jp/admin/infra_local/#risken) to download the Kubernetes manifest sample.
- Fix the Kubernetes object specs of the manifest file as follows and deploy it.

`k8s-sample/overlays/local/gateway.yaml`

| service | spec                                | before (public images)                     | after (pre-build images on your machine) |
| ------- | ----------------------------------- | ------------------------------------------ | ---------------------------------------- |
| web     | spec.template.spec.containers.image | `public.ecr.aws/risken/gateway/web:latest` | `gateway/web:latest`                     |

- You can access `http://localhost/` on your browser.


## Community

Info on reporting bugs, getting help, finding roadmaps,
and more can be found in the [RISKEN Community](https://github.com/ca-risken/community).

## License

[MIT](LICENSE).
