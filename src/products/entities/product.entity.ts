import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string 

    @Column()
    title! :string

    @Column({nullable:true})
    description? : string
    
    
    @Column({nullable:true})
    vialSize? : string

    
    @Column({nullable:true})
    concentration? : string

    
    @Column({nullable:true , unique:true })
    sku? : string

    
    @Column({nullable:true})
    sortOrder? : number

    
    @Column()
     isActive? : boolean

    @Column()
    commingSoon? : boolean

    @Column()
    inventoryEnabled! : boolean

    
    @Column()
    basePrice! : number

     @Column()
    floorPrice! : number
     @Column()
    displayPrice! : number
    @Column()
    ceilingPrice! :number


}
