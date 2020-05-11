const _ = require('lodash');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const process = require('process');
const fs = require('fs');
const pkg = require('../package.json');
const debug = require('debug')(pkg.name);

const CWD = process.cwd()

const clients = {}

let proto_dir = 'proto/'

const registerService = async (option) => {
    const { name, endpoint, force = false } = option
    if(_.hasIn(clients, name) && !force){
      return clients[name];
    }
    try{
      const proto_path = path.join(proto_dir, name + '.proto')
      if(!fs.existsSync(proto_path)){
        return Promise.reject({message: 'proto file ' + name + ' not defined'});
      }
      const packageDefinition = protoLoader.loadSync(
        proto_path,
        {keepCase: true,
         longs: String,
         enums: String,
         defaults: true,
         oneofs: true
        });
      const proto = grpc.loadPackageDefinition(packageDefinition)[name]
      clients[name] = {}
      _.map(proto, ( mod, sname)  => {
        if(!_.has(mod, 'service')){
          return
        }
        clients[name][sname] = new mod(endpoint, grpc.credentials.createInsecure())
      })
      return 1
    }catch(e){
      debug('register server failed: %O', e)
      return Promise.reject({message: 'register server failed'})
    }
}

module.exports = {
  bind: (fpm) => {

    const bizModule = {
      register: async (args) => {
        return registerService(args)
      },
      call: async (args) => {
        const { proto, service, rpc , param } = args
        const client = clients[proto][service]
        return new Promise( (rs, rj) => {
          client[rpc](param, function(e, rsp){
            if(e){
              rj(e)
              return
            }
            rs(rsp)
          })
        })
      }
    };
    // Run When Server Init
    fpm.registerAction('INIT', () => {
      const c = _.assign( fpm.getConfig('grpc'),
        {
          proto_dir: path.join(CWD, 'proto'),
          protos: []
        })
      proto_dir = c.proto_dir
      _.map(c.protos, item => {
        registerService(item).catch(fpm.logger.error)
      })
      debug('%o', c);
    })

    fpm.registerAction('BEFORE_SERVER_START', () => {
      fpm.extendModule('grpc', bizModule)
    })
    return bizModule;
  }
}
