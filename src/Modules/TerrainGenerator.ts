export class TerrainGenerator {
    distortion = 0.7
    ground_model_offset = new Vector3(0, 0, 0)
    terrain_offset = new Vector3(0, 0, 0)

    set_ground_model_offset(ground_model_offset){
        this.ground_model_offset = ground_model_offset
    }

    set_terrain_offset(terrain_offset){
        this.terrain_offset = terrain_offset
    }

    generate_terrain_info(width, height){
        var terrain_info = []

        for(var w = 0; w < width; w++){
            terrain_info[w] = []

            for(var h = 0; h < height; h++){
                terrain_info[w][h] = Math.random() * (this.distortion * Math.random())
            }
        }

        return terrain_info
    }

    generate_simple_terrain(width, height, ground_creator_function){
        var terrain_info = this.generate_terrain_info(width, height)
        var terrain_models = []
        var position
        var scale

        for(var w = 0; w < width; w++){
            terrain_models[w] = []

            for(var h = 0; h < height; h++){
                terrain_models[w][h] = ground_creator_function()

                position = terrain_models[w][h].getComponent(Transform).position
                scale = terrain_models[w][h].getComponent(Transform).scale

                position.x = (w * this.ground_model_offset.x) + this.terrain_offset.x
                position.z = (h * this.ground_model_offset.z) + this.terrain_offset.z
                position.y = (terrain_info[w][h] * 2) + this.ground_model_offset.y

                scale.y *= terrain_info[w][h]
            }
        }

        return [terrain_info, terrain_models]
    }
}