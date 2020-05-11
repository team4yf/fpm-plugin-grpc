const { init, Func } = require("fpmc-jssdk");
const assert = require('assert');
init({ appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

describe('Function', function(){
  beforeEach(done => {
    done()
  })


  afterEach(done => {
    done()
  })

  before(async () => {
    try {
      const data = await new Func('grpc.register').invoke({ name: 'drm', endpoint: 'localhost:5009' })
      assert.strictEqual(data == undefined, false, 'should not be undefined');
    } catch (error) {
      throw error;
    }
  })

  it('Function error', async () => {
    try {
      const data = await new Func('grpc.register').invoke({ name: 'drm2', endpoint: 'localhost:50093' })
      assert.strictEqual(data == undefined, false, 'should not be undefined');
    } catch (error) {
      throw error;
    }
  })

  it('Function calls', async () => {
    try {
      const data = await new Func('grpc.call').invoke(
        {
          proto: 'drm',
          service: 'DeviceRenew',
          rpc: 'Renew',
          param: { project: 'foo', device: 'bar', expire: 100 }
        }
      )
      assert.strictEqual(data == undefined, false, 'should not be undefined');
      assert.strictEqual(data.isOk, true, 'should be true');
    } catch (error) {
      throw error;
    }
  })
})
