import Phaser from 'phaser'

interface TilesetTileData {
    animation: Array<{ duration: number; tileid: number }>
}

const isTilesetTileDate = (data: any): data is TilesetTileData => 'animation' in data

interface AnimatedTileData {
    /**
     * gid of the original tile
     */
    index: number
    /**
     * array of frames
     */
    frames: Array<{ duration: number; tileid: number }>
    /**
     * start on first frame
     * */
    currentFrame: number
    /**
     * array with one array per layer with list of tiles that depends on this animation data
     * */
    tiles: Array<Phaser.Tilemaps.Tile[]>
    /**
     *  multiplier - set to 2 for double speed or 0.25 quarter speed
     * */
    rate: number
    next: number
}

interface IAnimatedTiles {
    map: Phaser.Tilemaps.Tilemap
    animatedTiles: ReturnType<AnimatedTiles['getAnimatedTiles']>
    active: boolean
    rate: number
    activeLayer: boolean[]
}

export class AnimatedTiles extends Phaser.Plugins.ScenePlugin {
    static readonly key = 'AnimatedTiles'
    static readonly mapping = 'animatedTiles'

    /**
     * Array with all tiles to animate
     */
    private animatedTiles: IAnimatedTiles[] = []

    /**
     * Should the animations play or not per layer.
     * If global active is false this value makes no difference.
     */
    private activeLayer: boolean[] = []

    /**
     * Obey timescale?
     */
    private followTimeScale = true

    /**
     * Should the animations play or not?
     */
    public active = false

    /**
     * Global playback rate
     */
    public rate = 1

    constructor(
        scene: Phaser.Scene,
        pluginManager: Phaser.Plugins.PluginManager,
        pluginKey: string
    ) {
        super(scene, pluginManager, pluginKey)
    }

    boot(): void {
        const eventEmitter = this.systems?.events

        eventEmitter?.on('postupdate', this.postUpdate, this)
        eventEmitter?.on('shutdown', this.shutdown, this)
        eventEmitter?.on('destroy', this.destroy, this)
    }

    shutdown(): void {
        // dercetech@github: this fixes a memory leak; a ref to all tiles
        // in a scene would be retained in spite of switching scenes.
        this.animatedTiles.length = 0
    }

    destroy(): void {
        this.shutdown()
        // @ts-expect-error
        this.scene = undefined
    }

    init(map: Phaser.Tilemaps.Tilemap): void {
        const mapAnimData = this.getAnimatedTiles(map)
        const animatedTiles: IAnimatedTiles = {
            map,
            animatedTiles: mapAnimData,
            active: true,
            rate: 1,
            activeLayer: [],
        }

        animatedTiles.activeLayer = map.layers.map(() => true)

        this.animatedTiles.push(animatedTiles)

        if (this.animatedTiles.length === 1) {
            // Start the animations by default
            this.active = true
        }
    }

    start(): void {
        return
    }

    stop(): void {
        return
    }

    postUpdate(_time: number, delta: number) {
        if (!this.active) {
            return
        }

        // Elapsed time is the delta multiplied by the global rate and
        // the scene timeScale if folowTimeScale is true
        const globalElapsedTime =
            delta * this.rate * (this.followTimeScale && this.scene ? this.scene.time.timeScale : 1)

        for (const mapAnimData of this.animatedTiles) {
            if (!mapAnimData.active) {
                continue
            }

            // Multiply with rate for this map
            const elapsedTime = globalElapsedTime * mapAnimData.rate

            for (const animatedTile of mapAnimData.animatedTiles) {
                // Reduce time for current tile, multiply elapsedTime with this tile's private rate
                animatedTile.next -= elapsedTime * animatedTile.rate
                // Time for current tile is up!!!
                if (animatedTile.next < 0) {
                    // Remember current frame index
                    const currentIndex = animatedTile.currentFrame

                    // Remember the tileId of current tile
                    const oldTileId = animatedTile.frames[currentIndex]
                        ? animatedTile.frames[currentIndex].tileid
                        : 0

                    // Advance to next in line
                    let newIndex = currentIndex + 1

                    // If we went beyond last frame, we just start over
                    if (newIndex > animatedTile.frames.length - 1) {
                        newIndex = 0
                    }

                    // Set lifelength for current frame
                    animatedTile.next = animatedTile.frames[newIndex].duration

                    // Set index of current frame
                    animatedTile.currentFrame = newIndex

                    // Store the tileId (gid) we will shift to
                    // Loop through all tiles (via layers)
                    //this.updateLayer
                    for (const [layerIndex, layer] of animatedTile.tiles.entries()) {
                        if (!mapAnimData.activeLayer[layerIndex]) {
                            continue
                        }

                        this.updateLayer(animatedTile, layer, oldTileId)
                    }
                }
            }
        }
    }

    updateLayer(animatedTile: AnimatedTileData, layer: Phaser.Tilemaps.Tile[], oldTileId = -1) {
        const tilesToRemove: Phaser.Tilemaps.Tile[] = []
        const tileId = animatedTile.frames[animatedTile.currentFrame].tileid

        for (const tile of layer) {
            // If the tile is removed or has another index than expected, it's
            // no longer animated. Mark for removal.
            if (oldTileId > -1 && tile?.index !== oldTileId) {
                tilesToRemove.push(tile)
            } else {
                // Finally we set the index of the tile to the one specified by
                // current frame
                tile.index = tileId
            }
        }

        // Remove obselete tiles
        for (const tile of tilesToRemove) {
            const tileIdx = layer.indexOf(tile)

            if (tileIdx > -1) {
                layer.splice(tileIdx, 1)
            } else {
                console.error(
                    "This shouldn't happen. Not at all. Blame Phaser Animated Tiles plugin. You'll be fine though."
                )
            }
        }
    }

    getAnimatedTiles(map: Phaser.Tilemaps.Tilemap) {
        const animatedTiles = []

        for (const tileset of map.tilesets) {
            const tileData = tileset.tileData

            for (const [tileDataIndex, data] of Object.entries(tileData)) {
                const index = parseInt(tileDataIndex)

                if (!isTilesetTileDate(data)) {
                    continue
                }

                const animatedTileData: AnimatedTileData = {
                    index: index + tileset.firstgid, // gid of the original tile
                    frames: [], // array of frames
                    currentFrame: 0, // start on first frame
                    tiles: [], // array with one array per layer with list of tiles that depends on this animation data
                    rate: 1, // multiplier, set to 2 for double speed or 0.25 quarter speed
                    next: 0,
                }

                // push all frames to the animatedTileData
                for (const animation of data.animation) {
                    const frame = {
                        duration: animation.duration,
                        tileid: animation.tileid + tileset.firstgid,
                    }

                    animatedTileData.frames.push(frame)
                }

                // time until jumping to next frame
                animatedTileData.next = animatedTileData.frames[0]?.duration ?? 0

                // set correct currentFrame if animation starts with different tile than the one with animation flag
                animatedTileData.currentFrame = animatedTileData.frames.findIndex(
                    (frame) => frame.tileid === index + tileset.firstgid
                )

                // Go through all layers for tiles
                for (const layer of map.layers) {
                    // tiles array for current layer
                    const tiles: Phaser.Tilemaps.Tile[] = []

                    // loop through all rows with tiles...
                    for (const tileRow of layer.data) {
                        for (const tile of tileRow) {
                            if (tile.index - tileset.firstgid === index) {
                                tiles.push(tile)
                            }
                        }
                    }

                    // add the layer's array with tiles to the tiles array.
                    // this will make it possible to control layers individually in the future
                    animatedTileData.tiles.push(tiles)
                }

                // animatedTileData is finished for current animation
                animatedTiles.push(animatedTileData)
            }
        }

        for (const [layerIndex] of map.layers.entries()) {
            // layer indices array of booleans whether to animate tiles on layer or not
            this.activeLayer[layerIndex] = true
        }

        return animatedTiles
    }

    updateAnimatedTiles() {
        const container = this.animatedTiles

        for (const mapAnimData of container) {
            const chkX = 0
            const chkY = 0
            const chkW = mapAnimData.map.width ?? 10
            const chkH = mapAnimData.map.height ?? 10

            for (const tileAnimData of mapAnimData.animatedTiles) {
                for (const [layerIndex, tiles] of tileAnimData.tiles.entries()) {
                    // const layer = mapAnimData.map.layers[layerIndex];

                    for (let x = chkX; x < chkX + chkW; x++) {
                        for (let y = chkY; y < chkY + chkH; y++) {
                            const tile = mapAnimData.map.layers[layerIndex].data[x][y]
                            // should this tile be animated?
                            if (tile && tile.index == tileAnimData.index) {
                                // is it already known? if not, add it to the list
                                if (tiles.indexOf(tile) === -1) {
                                    tiles.push(tile)
                                }

                                // update index to match current fram of this animation
                                tile.index = tileAnimData.frames[tileAnimData.currentFrame].tileid
                            }
                        }
                    }
                }
            }
        }
    }
}
