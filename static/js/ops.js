const app = new Vue({
  el: '#app',
  data() {
    return {
      ops,
      nameOk: true,
      newOpName: '',
      debounced: true,
      addOp: false,
      searchItem: '',
      form:{
        name: '',
        startDate: '',
        endDate: ''
      }
    }
  },
  watch: {
    form: {
      deep: true,
      handler(){
        this.nameOk = true
        if(this.form.name === '') return
        const dico = ' abcdefghijklmnopqrstuvwxyz0123456789-'.split('')
        this.form.name = this.form.name
          .split('')
          .map(c =>  c.toLowerCase())
          .filter(c => !!~dico.indexOf(c))
          .join('')
          .toUpperCase()
        this.debounced ? setTimeout(this.checkOp, 500) : ''
        this.debounced = false
      }
    }
  },
  methods: {
    checkOp(){
      this.debounced = true
      this.$http
        .get('/checkDuplicate/' + this.form.name.toLowerCase())
        .then(res => this.nameOk = res.data.freeName)
    },
    submitForm(){
      if(!this.debounced) return setTimeout(this.submitForm, 500)
      if(this.form.name === '') return this.nameOk = false
      if(this.nameOk){
        this.$http
          .post('/newOp/', this.form)
          .then(res => {
            this.$set(ops, ops.length, res.data)
            Object.keys(this.form)
              .forEach(field => this.form[field] = '')
            this.addOp = false
          })
      }
    },
    searchIconClick(){
      if(this.searchItem === '') this.$refs.searchInput.focus()
    },
    shouldHide(ev){
      ev.target.id === 'newOpForm' ? this.addOp = false : ''
    }
  }
})