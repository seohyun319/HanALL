import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
const esClient = require("../models/connection.ts");
const index: String = "words";

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    let { sort } = req.query;
    if (sort) {
      try {
        const result = await esClient.search({
          index: index,
          sort: [`${sort}:desc`],
          body: {
            _source: ["title", "hits", "scraps", "created_at"],
            query: {
              match: {
                type: "spacing",
              },
            },
          },
        });
        res.status(200).json(result.body.hits.hits);
      } catch (err) {
        console.error(err);
        next(err);
      }
    } else {
      try {
        const sort_hits_result = await esClient.search({
          index: index,
          body: {
            _source: ["title", "hits"],
            sort: { hits: "desc" },
            size: "3",
            query: {
              match: {
                type: "spacing",
              },
            },
          },
        });
        const sort_crt_result = await esClient.search({
          index: index,
          body: {
            _source: ["title", "hits"],
            sort: { created_at: "desc" },
            size: "3",
            query: {
              match: {
                type: "spacing",
              },
            },
          },
        });
        const result: Array<JSON> = [];
        result.push(sort_hits_result.body.hits.hits);
        result.push(sort_crt_result.body.hits.hits);
        res.status(200).json(result);
      } catch (err) {
        console.error(err);
        next(err);
      }
    }
  });

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await esClient.search({
        index: index,
        body: {
          query: {
            bool: {
              must: [
                { match: { type: "spacing" } },
                { match: { _id: req.params.id } },
              ],
            },
          },
        },
      });
      let related = await esClient.search({
        index: index,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: result.body.hits.hits[0]._source.right_words,
                    fields: ["right_words", "wrong_words"],
                  },
                },
              ],
              must_not: [
                {
                  match: {
                    _id: result.body.hits.hits[0]._id,
                  },
                },
              ],
            },
          },
        },
      });
      if (related.body.hits.total.value == 0) {
        related = "";
      } else {
        related = related.body.hits.hits[0]._id;
      }
      let hits = result.body.hits.hits[0]._source.hits;
      hits++;
      const count_hits = await esClient.update({
        index: index,
        id: req.params.id,
        body: {
          doc: {
            hits: hits,
            related: related,
          },
        },
      });
      res.status(200).json(result.body.hits.hits[0]._source);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;

/**
 * @swagger
 * paths:
 *  /api/spacings:
 *      get:
 *          tags: [spacing]
 *          summary: 띄어쓰기 정보 조회
 *          description: 띄어쓰기 정보 조회
 *          parameters:
 *          - in: query
 *            name: "sort"
 *            description: 정렬 방식을 입력하세요.(created_at / hits / scraps)
 *            required: false
 *            schema:
 *                type: string
 *                description: sort
 *          produces:
 *          - application/json
 *          responses:
 *              200:
 *                  description: 띄어쓰기 정보 조회 성공
 *  /api/spacings/{id}:
 *      get:
 *          tags: [spacing]
 *          summary: 띄어쓰기 정보 세부 조회
 *          description: 띄어쓰기 정보 세부 조회
 *          parameters:
 *          - in: path
 *            name: "id"
 *            description: 게시글의 고유 아이디 값을 입력하세요.
 *            required: true
 *            schema:
 *                type: string
 *          produces:
 *          - application/json
 *          responses:
 *              200:
 *                  description: 띄어쓰기 정보 세부 조회 성공
 */
