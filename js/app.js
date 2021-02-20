const { ref, onMounted, watch, computed, reactive } = Vue

const app = Vue.createApp({
  setup(context) {
    const audio = new Audio()

    audio.volume = 0.3

    const angle = ref(0)
    const level = ref(0.1)
    // 0 = main
    // 1 = game
    // 2 = ggwp
    const game = ref(0)
    const score = ref(0)
    const userinput = ref(5)

    const restart = () => {
      userinput.value = 5
      score.value = 0
      angle.value = 0
      level.value = 0.1
      game.value = 1

      audio.pause()
      audio.currentTime = 0
      audio.src = './assets/bgm.mp3'
      audio.loop = true
      audio.play()
    }

    watch(angle, (value) => {
      if (value > 50 || value < -50) {
        game.value = 2
      }
    })

    watch(game, (value) => {
      if (game.value === 2) {
        angle.value = 0

        audio.src = './assets/fail2.mp3'
        audio.loop = false
        audio.play()
      }
    })

    const gameimg = computed(() => {
      return game.value < 2 ? './assets/hotpot.gif' : './assets/fail.png'
    })

    const roadimg = computed(() => {
      return game.value < 2? 'url(./assets/road.gif)' : 'url(./assets/road.jpg)'
    })

    const scoreText = computed(() => {
      return Math.round(score.value*10)/100
    })

    onMounted(() => {
      setInterval(() => {
        if (game.value === 1) {
          // add score
          score.value += 0.1

          // wind
          level.value += score.value * 0.00001
          const positive = Math.random() > 0.5
          const wind = Math.round(Math.random()*3)*level.value

          // user input
          angle.value += userinput.value - 5

          // wind
          angle.value += positive ? wind : wind*-1
        }
      }, 1000/60)
    })

    return {
      angle,
      level,
      game,
      score,
      gameimg,
      roadimg,
      userinput,
      scoreText,
      restart
    }
  }
}).mount('#app')