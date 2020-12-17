export function createGTLFShape(path: string, position: Vector3){
    var pos = new Vector3(position.x, position.y, position.z)
    var entity = new Entity()

    entity.addComponent(new Transform({position: pos}))
    entity.addComponent(new GLTFShape(path))
    engine.addEntity(entity)

    return entity
}

export function pillar_creator(){
    var pillar = new Entity()

    pillar.addComponent(new Transform({ 
        position: new Vector3(8, 1, 8),
        scale: new Vector3(7.5, 25, 7.5)
    }))

    pillar.addComponent(new GLTFShape("Models/Pillar.glb"))

    engine.addEntity(pillar)

    return pillar
}

export function sum_vec3(v1, v2){
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
}