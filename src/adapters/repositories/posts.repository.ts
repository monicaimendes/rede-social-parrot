import * as Sequelize from "sequelize"

import { IDatabaseModel } from "../../infrastructure/persistence/databasemodel.interface"
import { IPostEntity } from "../../domain/entities/posts/post.entity"
import { MysqlDatabase } from "../../infrastructure/persistence/mysql/mysql.database"
import { IPostsRepository } from "../../domain/repositories/posts.repository.interface"
import postsModel from "../../infrastructure/persistence/mysql/models/posts.models.mysql.database"
import modelToEntityPostsMysql from "../../infrastructure/persistence/mysql/helpers/posts/modelToEntity.posts.mysql"
import entityToModelPostsMysql from "../../infrastructure/persistence/mysql/helpers/posts/entityToModel.posts.mysql"
import logger from "../../infrastructure/logs/winston.logs"

export class PostsRepository implements IPostsRepository {
  constructor(private _database: IDatabaseModel, private _modelPosts: Sequelize.ModelCtor<Sequelize.Model<any, any>>) {}

  async create(resource: IPostEntity): Promise<IPostEntity> {
    const { Post } = entityToModelPostsMysql(resource)
    const postModel = await this._database.create(this._modelPosts, Post)
    postModel.idpost = postModel.null
    return postModel
  }

  async readById(resourceId: number): Promise<IPostEntity | undefined> {
    try {
      const post = await this._database.read(this._modelPosts, resourceId)
      return modelToEntityPostsMysql(post)
    } catch (err) {
      throw new Error((err as Error).message)
    }
  }

  async deleteById(resourceId: number): Promise<void> {
    await this._database.delete(this._modelPosts, { idpost: resourceId })
  }

  async list(): Promise<IPostEntity[]> {
    const postsModel = await this._database.list(this._modelPosts)
    const post = postsModel.map(modelToEntityPostsMysql)
    return post
  }

  async updateById(resource: IPostEntity): Promise<IPostEntity | undefined> {
    let postModel = await this._database.read(this._modelPosts, resource.idpost!)
    const { Post } = entityToModelPostsMysql(resource)
    await this._database.update(postModel, Post)
    return resource
  }

  async readByWhere(iduser: string): Promise<IPostEntity | undefined> {
    try {
      const post = await this._database.readByWhere(this._modelPosts, {
        iduser: iduser,
      })

      return modelToEntityPostsMysql(post)
    } catch (err) {
      throw new Error((err as Error).message)
    }
  }

  async listByIdUser(resourceId: number): Promise<IPostEntity[] | undefined> {
    try {
      const posts = await this._database.listByWhere(this._modelPosts, {
        iduser : resourceId
      })
      return posts
    } catch (err) {
      logger.error('Erro ao listar posts por usuário:', err)
      throw new Error((err as Error).message)
    }
  }
}

export default new PostsRepository(MysqlDatabase.getInstance(), postsModel)
