import obstacleHooks from './obstacleHooks'
import playerHooks from './playerHooks'

export default (simulator) => {
	const { renderer, obstacles } = simulator
	console.log('sim', simulator)
    return {
        'PlayerCharacter': playerHooks({ renderer, simulator }),
        'Obstacle': obstacleHooks({ renderer, obstacles })
    }
}
