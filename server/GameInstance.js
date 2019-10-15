import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig.js'
import PlayerCharacter from '../common/entity/PlayerCharacter.js'
import Identity from '../common/message/Identity.js'
import WeaponFired from '../common/message/WeaponFired.js'
import CollisionSystem from '../common/CollisionSystem.js'
import followPath from './followPath.js'
import damagePlayer from './damagePlayer.js'
import instanceHookAPI from './instanceHookAPI.js'
import applyCommand from '../common/applyCommand.js'
import setupObstacles from './setupObstacles.js'
import { fire } from '../common/weapon.js'
import Notification from '../common/message/Notification'
import lagCompensatedHitscanCheck from './lagCompensatedHitscanCheck'

class GameInstance {
    constructor() {
<<<<<<< HEAD
        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        instanceHookAPI(this.instance)
=======

        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        niceInstanceExtension(this.instance)
>>>>>>> master

        // game-related state
        this.obstacles = setupObstacles(this.instance)
        // (the rest is just attached to client objects when they connect)

        this.instance.on('connect', ({ client, callback }) => {
<<<<<<< HEAD
=======
            // PER player-related state, attached to clients

>>>>>>> master
            // create a entity for this client
            const rawEntity = new PlayerCharacter()

            // make the raw entity only visible to this client
            const channel = this.instance.createChannel()
            channel.subscribe(client)
<<<<<<< HEAD

            this.instance.message(new Notification('yolo'), client)
            channel.addMessage(new Notification('private channel created'))
            channel.addEntity(rawEntity)
            this.instance.addEntity(rawEntity)
=======
            channel.addEntity(rawEntity)
            //this.instance.addEntity(rawEntity)
>>>>>>> master
            client.channel = channel

            // smooth entity is visible to everyone
            const smoothEntity = new PlayerCharacter()
            smoothEntity.collidable = true
            this.instance.addEntity(smoothEntity)

            // tell the client which entities it controls
            this.instance.message(new Identity(rawEntity.nid, smoothEntity.nid), client)

            // establish a relation between this entity and the client
            rawEntity.client = client
            client.rawEntity = rawEntity
            smoothEntity.client = client
            client.smoothEntity = smoothEntity
            client.positions = []

            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: rawEntity.x,
                y: rawEntity.y,
<<<<<<< HEAD
                halfWidth: 500,
                halfHeight: 500
=======
                halfWidth: 99999,
                halfHeight: 99999
>>>>>>> master
            }

            // accept the connection
            callback({ accepted: true, text: 'Welcome!' })
        })

        this.instance.on('disconnect', client => {
            // clean up per client state
<<<<<<< HEAD
            client.channel.removeEntity(client.rawEntity)
=======
>>>>>>> master
            this.instance.removeEntity(client.rawEntity)
            this.instance.removeEntity(client.smoothEntity)
            client.channel.destroy()
        })

        this.instance.on('command::MoveCommand', ({ command, client, tick }) => {
            // move this client's entity
            const rawEntity = client.rawEntity
            const smoothEntity = client.smoothEntity
            applyCommand(rawEntity, command, this.obstacles)
            client.positions.push({
                x: rawEntity.x,
                y: rawEntity.y,
                rotation: rawEntity.rotation
            })
        })

        this.instance.on('command::FireCommand', ({ command, client, tick }) => {
            // shoot from the perspective of this client's entity
            const rawEntity = client.rawEntity
            const smoothEntity = client.smoothEntity

            if (fire(rawEntity)) {
                let endX = command.x
                let endY = command.y

                this.obstacles.forEach(obstacle => {
                    const hitObstacle = CollisionSystem.checkLinePolygon(rawEntity.x, rawEntity.y, command.x, command.y, obstacle.collider.polygon)
                    if (hitObstacle) {
                        endX = hitObstacle.x
                        endY = hitObstacle.y
                    }
                })

                const timeAgo = client.latency + 100
<<<<<<< HEAD
                const hits = lagCompensatedHitscanCheck(this.instance, rawEntity.x, rawEntity.y, endX, endY, timeAgo)

                hits.forEach(victim => {
=======

                this.lagCompensatedHitscanCheck(rawEntity.x, rawEntity.y, endX, endY, timeAgo, (victim) => {
>>>>>>> master
                    if (victim.nid !== rawEntity.nid && victim.nid !== smoothEntity.nid) {
                        damagePlayer(victim)
                    }
                })

                this.instance.addLocalMessage(new WeaponFired(smoothEntity.nid, smoothEntity.x, smoothEntity.y, command.x, command.y))
            }
        })
    }

<<<<<<< HEAD
=======
    lagCompensatedHitscanCheck(x1, y1, x2, y2, timeAgo, onHit) {
        const area = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            halfWidth: Math.abs(x2 - x1),
            halfHeight: Math.abs(y2 - y1)
        }

        const compensatedEntityPositions = this.instance.historian.getLagCompensatedArea(timeAgo, area)
        compensatedEntityPositions.forEach(entityProxy => {
            // look up the real entity
            const realEntity = this.instance.entities.get(entityProxy.nid)

            if (realEntity && realEntity.collidable) {
                const tempX = realEntity.x
                const tempY = realEntity.y

                // rewind
                realEntity.x = entityProxy.x
                realEntity.y = entityProxy.y

                const hit = CollisionSystem.checkLineCircle(x1, y1, x2, y2, realEntity.collider.circle)

                // restore
                realEntity.x = tempX
                realEntity.y = tempY

                if (hit) {
                    onHit(realEntity)
                }
            }
        })
    }

>>>>>>> master
    update(delta, tick, now) {
        this.instance.emitCommands()

        this.instance.clients.forEach(client => {
            // move client view to follow the client's entity
            // (client view is a rectangle used for culling network data)
            client.view.x = client.rawEntity.x
            client.view.y = client.rawEntity.y

            // have the smooth entity follow the raw entity
            const smoothEntity = client.smoothEntity
            if (smoothEntity) {
                const maximumMovementPerFrameInPixels = 410 * delta
                followPath(smoothEntity, client.positions, maximumMovementPerFrameInPixels)
            }
        })

        // when instance.updates, nengi sends out snapshots to every client
        this.instance.update()
    }
}

export default GameInstance
