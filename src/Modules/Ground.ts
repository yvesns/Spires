import * as misc from "./Misc"

export class Ground{
    map_width = 13
    map_length = 13
    floor_texture = "Images/SnowyGround.png"
    plant_count = 200
    plant_model = "Models/Plants.glb"
    
    constructor(){
      var position = new Vector3((16 * this.map_width)/2, 0, (16 * this.map_length)/2)
      var ground = this.create_floor_texture(this.floor_texture, position)
      ground.getComponent(Transform).scale = new Vector3(16 * this.map_width, 16 * this.map_length, 0)

      this.generate_plants()
    }

    generate_plants(){
      var x, z
      var margin = 2

      for(var i = 0; i < this.plant_count; i++){
        x = Math.random() * (16 * this.map_width)
        z = Math.random() * (16 * this.map_length)

        if(x < margin){
          x += margin
        }

        if(x > (16 * this.map_width) - margin){
          x -= margin
        }

        if(z < margin){
          z += margin
        }

        if(z > (16 * this.map_length) - margin){
          z -= margin
        }

        misc.createGTLFShape(this.plant_model, new Vector3(x, 0, z))
      }
    }

    create_plane(position) {
      const plane = new Entity()
    
      plane.addComponent(new Transform({position: new Vector3(position.x, position.y, position.z)}))
      plane.addComponent(new PlaneShape())
    
      return plane
    }

    create_floor_texture(texture, position) {
      var entity = this.create_plane(position)
      var material = new BasicMaterial()
    
      entity.getComponent(Transform).scale = new Vector3(16, 16, 0)
      entity.getComponent(Transform).rotation = Quaternion.Euler(90, 0, 0)
    
      material.texture = new Texture(texture)
      entity.addComponent(material)
    
      engine.addEntity(entity)
    
      return entity
    }
}