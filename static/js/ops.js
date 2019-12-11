const app = new Vue({
  el: '#app',
  data() {
    return {
      nameOk: true,
      newOpName: '',
      debounced: true,
      addOp: false,
    }
  },
  watch: {
    newOpName(){
      if(this.newOpName === '') return
      const dico = ' abcdefghijklmnopqrstuvwxyz0123456789-'.split('')
      this.newOpName = this.newOpName
        .split('')
        .map(c =>  c.toLowerCase())
        .filter((c, i) => !!~dico.indexOf(c))
        .join('')
        .toUpperCase()
      this.debounced ? setTimeout(this.checkOp, 500) : ''
      this.debounced = false
    }
  },
  methods: {
    checkOp(){
      this.debounced = true
      this.$http
        .get('/checkDuplicate/' + this.newOpName.toLowerCase())
        .then(res => this.nameOk = res.data.freeName)
    },
    submitForm(){
      if(!this.debounced) return setTimeout(this.submitForm, 500)
      if(this.nameOk){
        this.$refs.send.click()
      }
    }
  },
})