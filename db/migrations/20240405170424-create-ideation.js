'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      const TYPES = {
        abuse: 'abuse', // is abusive or insulting
        obscene: 'obscene', // contains obscene language
        spam: 'spam', // contains spam or is unrelated to topic
        hate: 'hate', // contains hate speech
        netiquette: 'netiquette', // infringes (n)etiquette
        duplicate: 'duplicate' // duplicate
      };
      return Promise.all([
        queryInterface.createTable('Ideations',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4
            },
            creatorId: {
              type: Sequelize.UUID,
              allowNull: false,
              comment: 'User who created the ideation.',
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            question: {
              type: Sequelize.STRING(2048),
              allowNull: true,
              comment: 'Question the ideation is gathering ideas for'
            },
            deadline: {
              type: Sequelize.DATE,
              allowNull: true,
              comment: 'Deadline for the ideation'
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),
        queryInterface.createTable('Ideas',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4
            },
            ideationId: {
              type: Sequelize.UUID,
              allowNull: false,
              comment: 'Ideation id.',
              references: {
                model: 'Ideations',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            authorId: {
              type: Sequelize.UUID,
              allowNull: false,
              comment: 'Author of the idea',
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            statement: {
              type: Sequelize.STRING(2048),
              allowNull: true,
              comment: 'Main idea statement'
            },
            description: {
              type: Sequelize.STRING,
              allowNull: true,
              comment: 'Idea description'
            },
            imageUrl: {
              type: Sequelize.STRING,
              allowNull: true,
              comment: 'Image for the idea'
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),
        queryInterface.createTable('TopicIdeations',
          {
            topicId: {
              type: Sequelize.UUID,
              allowNull: false,
              comment: 'To what Topic this Ideation belongs to.',
              references: {
                model: 'Topics',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            ideationId: {
              type: Sequelize.UUID,
              allowNull: false,
              comment: 'Ideation id.',
              references: {
                model: 'Ideations',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),

        queryInterface.createTable('IdeaVotes',
          {
            ideaId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: 'Ideas',
                key: 'id'
              },
              primaryKey: true,
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            creatorId: {
              type: Sequelize.UUID,
              comment: 'User ID of the voter',
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            value: {
              type: Sequelize.INTEGER,
              comment: 'Vote value. Numeric, can be negative on down-vote.',
              allowNull: false,
              validate: {
                isIn: {
                  args: [[1, 0, -1]],
                  msg: 'Vote value must be 1 (up-vote), -1 (down-vote) OR 0 to clear vote.'
                }
              }
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),
        queryInterface.createTable('IdeaFavorites',
          {
            ideaId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: 'Ideas',
                key: 'id'
              },
              primaryKey: true,
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            userId: {
              type: Sequelize.UUID,
              comment: 'User ID who favourited the idea',
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),
        queryInterface.createTable('Folders',
          {
            id: {
              type: Sequelize.UUID,
              allowNull: false,
              primaryKey: true
            },
            creatorId: {
              type: Sequelize.UUID,
              comment: 'User ID who favourited the idea',
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            name: {
              type: Sequelize.STRING(512),
              allowNull: true,
              comment: 'Folder name'
            },
            description: {
              type: Sequelize.STRING(2048),
              allowNull: true,
              comment: 'Folder description'
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deletedAt: {
              allowNull: true,
              type: Sequelize.DATE
            },
          }, {
          transaction: t
        }),
        queryInterface.createTable('FolderIdeas',
          {
            folderId: {
              type: Sequelize.UUID,
              comment: 'Folder where idea belongs',
              allowNull: false,
              references: {
                model: 'Folders',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            ideaId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: 'Ideas',
                key: 'id'
              },
              primaryKey: true,
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            }
          }, {
          transaction: t
        }),
        queryInterface.createTable('IdeaComments',
          {
            commentId: {
              type: Sequelize.UUID,
              comment: 'Which Comment belongs to this Idea.',
              allowNull: false,
              references: {
                model: 'Folders',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              primaryKey: true
            },
            ideaId: {
              type: Sequelize.UUID,
              comment: 'To what Idea this Comment belongs to.',
              allowNull: false,
              references: {
                model: 'Ideas',
                key: 'id'
              },
              primaryKey: true,
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            }
          }, {
          transaction: t
        }),
        queryInterface.createTable(
          'IdeaReports',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              allowNull: false,
              defaultValue: Sequelize.UUIDV4
            },
            type: {
              type: Sequelize.ENUM,
              values: Object.values(TYPES),
              allowNull: false,
              comment: 'Report reason - verbal abuse, obscene content, hate speech etc..'
            },
            text: {
              type: Sequelize.STRING(2048),
              allowNull: false,
              validate: {
                len: {
                  args: [1, 2048],
                  msg: 'Report text can be 1 to 2048 characters long.'
                }
              },
              comment: 'Additional comment for the report to provide more details on the violation.'
            },
            creatorId: {
              type: Sequelize.UUID,
              comment: 'User ID of the reporter.',
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            creatorIp: {
              type: Sequelize.STRING(45), // No specific DataType in Sequelize so STRING(45) supports IPv6 and IPv4 notations
              comment: 'IP address of the reporter',
              allowNull: false
            },
            ideaId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: 'Ideas',
                key: 'id'
              },
              primaryKey: true,
              comment: 'Id of the Idea which the Report belongs to.'
            },
            moderatedById: {
              type: Sequelize.UUID,
              allowNull: true,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              comment: 'User ID of the person who moderated the Idea on report. That is, a Moderator agreed that Report is valid.'
            },
            moderatedAt: {
              type: Sequelize.DATE,
              comment: 'Time when the Idea was Moderated',
              allowNull: true
            },
            moderatedReasonType: {
              type: Sequelize.ENUM,
              values: Object.values(TYPES),
              allowNull: true,
              comment: 'Moderation reason - verbal abuse, obscene content, hate speech etc..'
            },
            moderatedReasonText: {
              type: Sequelize.STRING(2048),
              allowNull: true,
              comment: 'Additional comment for the Report to provide more details on the Moderator acton.'
            },
            resolvedById: {
              type: Sequelize.UUID,
              allowNull: true,
              references: {
                model: 'Users',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
              comment: 'User ID of the person who considered the issue to be resolved thus making the report outdated.'
            },
            resolvedAt: {
              type: Sequelize.DATE,
              allowNull: true,
              comment: 'Time when the Report was marked as resolved.'
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false
            },
            deletedAt: {
              type: Sequelize.DATE
            }
          }
        ),
        queryInterface.sequelize.query(
          `ALTER TYPE "enum_Topics_status" ADD VALUE 'ideation' BEFORE 'inProgress'`
          , { transaction: t })
      ])
    });

  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable('Ideation', { transaction: t }),
        queryInterface.dropTable('Ideas', { transaction: t }),
        queryInterface.dropTable('TopicIdeations', { transaction: t }),
        queryInterface.dropTable('IdeaVotes', { transaction: t }),
        queryInterface.dropTable('IdeaFavorites', { transaction: t }),
        queryInterface.dropTable('Folders', { transaction: t }),
        queryInterface.dropTable('FolderIdeas', { transaction: t }),
        queryInterface.dropTable('IdeaComments', { transaction: t }),
        queryInterface.dropTable('IdeaReports', { transaction: t }),
        queryInterface
          .dropTable('TopicReports', { transaction: t })
          .then(function () { // While Sequelize does not support naming ENUMS, it creates duplicates - https://github.com/sequelize/sequelize/issues/2577
            return queryInterface.sequelize
              .query('DROP TYPE IF EXISTS "enum_TopicReports_moderatedReasonType";', { transaction: t });
          })
          .then(function () {
            return queryInterface.sequelize
              .query('DROP TYPE IF EXISTS "enum_TopicReports_type";', { transaction: t });
          }),
        queryInterface.sequelize.query(
          `ALTER TYPE "enum_Topics_status" REMOVE VALUE 'ideation' BEFORE 'inProgress'`
          , { transaction: t })
      ]);
    });
  }
};
