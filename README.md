## FPM-PLUGIN-GRPC
用于 GRPC 客户端调用的插件

### Install
```bash
npm i fpm-plugin-grpc --save
```

### Useage

- config

```json
{
  "proto_dir": "/User/xxxxx/x/protos", // this should be absolute path
  "protos": [
    {
      "name": "foo",  // the proto file name
      "endpoint": "localhost:50093",  // the grpc server endpoint
    }
  ]
}
```

- subscribe

- other