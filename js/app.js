const app = {
  data() {
    return {
      connection: {
        host: 'broker.emqx.io',
        port: 8084,
        endpoint: '/mqtt',
        clean: true, // Reserved session
        connectTimeout: 30000, // Time out 3 seg
        reconnectPeriod: 1000, // Reconnection interval
        // Certification Information
        clientId: 'mqttvuejs_3be2c321',
        username: 'emqx_test',
        password: 'emqx_test',
      },
      subscription: {
        topic: [
          '0f101c78-e114-11eb-ba80-0242ac130004/casa/sala/sensor/temperatura/leitura/',
          '0f101c78-e114-11eb-ba80-0242ac130004/casa/sala/sensor/umidade/leitura/'
        ],
        qos: 0,
      },
      // publish: {
      //   topic: 'topic/browser',
      //   qos: 0,
      //   payload: '{ "msg": "Olá, eu sou um navegador." }',
      // },
      dht_temperature: ['Carregando...'],
      dht_humidity: ['Carregando...'],
      qosList: [
        { label: 0, value: 0 },
        { label: 1, value: 1 },
        { label: 2, value: 2 },
      ],
      client: {
        connected: false,
      },
      subscribeSuccess: false,
    }
  },
  methods: {
    // Create connection
    createConnection() {
      // Connect string, and specify the connection method used through protocol
      const { host, port, endpoint, ...options } = this.connection
      const connectUrl = `wss://${host}:${port}${endpoint}`
      try {
        this.client = mqtt.connect(connectUrl, options)
      } catch (error) {
        console.log('Erro no mqtt.connect [error]', error)
      }
      this.client.on('connect', () => {
        console.log('Conexão bem sucedida!')
      })
      this.client.on('error', error => {
        console.log('Conexão falhou', error)
      })
      this.client.on('message', (topic, message) => {

        if (topic == this.subscription.topic[0]){ //Sensor temperatura
          this.dht_temperature.push(message.toString())
        } else if (topic == this.subscription.topic[1]){ //Sensor umidade
          this.dht_humidity.push(message.toString())
        }

        console.log(`Mensagem recebida ${message} do tópico ${topic}`)
      })
    },
    doSubscribe() {
      const { topic, qos } = this.subscription
       this.client.subscribe(topic, { qos }, (error, res) => {
        if (error) {
          console.log('Erro ao inscrever-se no(s) tópico(s) [error]', error)
          return
        }
        this.subscribeSuccess = true
        console.log('Inscrito no(s) tópico(s) [res]', res)
        })
    },
    doUnSubscribe() {
      const { topic } = this.subscription
      this.client.unsubscribe(topic, error => {
        if (error) {
          console.log('Erro de cancelamento de inscrição', error)
        }
      })
    },
    destroyConnection() {
      if (this.client.connected) {
        try {
          this.client.end()
          this.client = {
            connected: false,
          }
          console.log('Desconectado com sucesso!')
        } catch (error) {
          console.log('A desconexão falhou', error.toString())
        }
      }
    }
  },
  mounted() {
      this.createConnection(),
      this.doSubscribe()
  },
}

Vue.createApp(app).mount('#app')