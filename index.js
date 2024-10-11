const allowedSites = [
  'http://localhost:9000',
  'http://192.168.10.160:9000',
  'http://192.168.10.189:2201',
  'http://192.168.10.238:1975'
];

const { Server } = require('socket.io');

const io = new Server({ cors: { origin: allowedSites } });

const deposits = io.of('/deposits')

deposits.on("connection", dep => {
  console.log(`connect ${dep.id}`);

  dep.on('Conexion', params => {
    
    console.log(`Conexion a sucursal ${params.session.store.alias}`)
    const room = params.session.store.id
    dep.join(room)
    dep.room = room
    dep.emit('Room', room)
  })

  dep.on('Create', (formulario) => {
    console.log(formulario);
    if (dep.room) {
      dep.to(dep.room).emit('StoreList', formulario);
    } else {
      console.error('Room no está definido');
    }
    deposits.emit('List', formulario);
  })                                                                                                                      
  
  dep.on('ChangeStatus', (formulario) => {
    console.log(formulario.store.id)
    dep.to(formulario.store.id).emit('ChangeStatus',formulario)
  })

  dep.on('ChangeTicket', (formulario) => {
    console.log(formulario.store.id)
    deposits.emit('ChangeTicket',formulario)
  })


  dep.on("disconnect", (reason) => {
    console.log(`disconnect ${dep.id} due to ${reason}`);
  });
});


io.listen(3000);