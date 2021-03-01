const { ref, onMounted, watch, computed, reactive } = Vue
const { useDeviceOrientation, useMouse } = VueUse

const valueAbsRange = (value, range) => Math.abs(value) >= range

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
    const enableOrientation = ref(true)
    const dateYear = ref(new Date().getFullYear())

    const mouse = reactive(useMouse())
    const device = reactive(useDeviceOrientation())
    const playAudio = (src, repeat = false) => {
      audio.currentTime = 0
      audio.src = src
      audio.loop = repeat
      audio.play()
    }

    const restart = (retry) => {
      userinput.value = 5
      score.value = 0
      angle.value = 0
      level.value = 0.1
      game.value = 1

      if (retry) {
        playAudio('./assets/again.mp3')
        
        audio.onended = () => {
          if (game.value === 1) {
            playAudio('./assets/bgm.mp3', true)
            audio.onended = undefined
          }
        }
  
      } else {
        playAudio('./assets/bgm.mp3', true)
      }
    }

    const grantDeviceOrientationEvent = async () => {
      const v = await window.DeviceOrientationEvent.requestPermission()
      return v === 'granted';
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
        (difficulty.value === 0 && valueAbsRange(value, 50)) ||
        // 簡單
        (difficulty.value === 1 && valueAbsRange(value, 60)) ||
        // 超級簡單
        (difficulty.value === 2 && valueAbsRange(value, 1080))
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
      return game.value < 2 ? 'url(./assets/road.gif)' : 'url(./assets/road.jpg)'
    })

    const scoreText = computed(() => {
      return Math.round(score.value * 10) / 100
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

      if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
        grantDeviceOrientationEvent().then(v => {
          enableOrientation.value = v
        })
      }
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
      difficulty,
      enableOrientation,
    }
  }
}).mount('#app')

const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
