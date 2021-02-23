const { ref, onMounted, watch, computed, reactive } = Vue
const { useDeviceOrientation, useMouse } = VueUse

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
    // 0 = input range
    // 1 = mouse
    // 2 = device
    const control = ref(0)
    // 0 = old difficulty
    // 1 = easy
    // 2 = very easy
    const difficulty = ref(0)

    const mouse = reactive(useMouse())
    const device = reactive(useDeviceOrientation())

    const dateYear = ref(new Date().getFullYear())

    const restart = (retry) => {
      userinput.value = 5
      score.value = 0
      angle.value = 0
      level.value = 0.1
      game.value = 1

      if (retry) {
        audio.src = './assets/again.mp3'
        audio.loop = false
        audio.play()
        
        audio.onended = () => {
          if (game.value === 1) {
            audio.src = './assets/bgm.mp3'
            audio.currentTime = 0
            audio.loop = true
            audio.play()
            audio.onended = null
          }
        }
  
      } else {
        audio.currentTime = 0
        audio.src = './assets/bgm.mp3'
        audio.loop = true
        audio.play()
      }
    }

    watch(mouse, value => {
      if (game.value === 1 && control.value === 1) {
        userinput.value = mouse.x / window.innerWidth*10
      }
    })

    watch(device, value => {
      if (game.value === 1 && control.value === 2) {
        const gamma = device.gamma <= -50.0 ? -50.0 : device.gamma >= 50.0 ? 50.0 : device.gamma
        userinput.value = (gamma / 10) + 5
      }
    })

    watch(angle, (value) => {
      if (
        // 困難
        (difficulty.value === 0 && (value > 50 || value < -50)) ||
        // 簡單
        (difficulty.value === 1 && (value > 60 || value < -60)) ||
        // 超級簡單
        (difficulty.value === 2 && (value > 1080 || value < -1080))
      ) {
        game.value = 2
      }
    })

    watch(game, (value, oldvalue) => {
      if (value === 2) {
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
          const wind = difficulty.value === 0 ? Math.round(Math.random()*3)*level.value : Math.round(Math.random()*5)/10*level.value
          
          // user input
          angle.value += userinput.value - 5

          // wind
          angle.value += positive ? wind : wind*-1
        }
      }, 1000/60)
    })

    return {
      angle,
      game,
      score,
      gameimg,
      roadimg,
      userinput,
      scoreText,
      restart,
      control,
      mouse,
      device,
      dateYear,
      difficulty
    }
  }
}).mount('#app')

const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
