"use strict";

const { Contract } = require("fabric-contract-api");

class ProductTypeContract extends Contract {
  async initProductType(ctx) {
    const assets = [
      {
        productTypeId: "PRT0000001",
        name: "Laptop",
        is_delete: false,
        updated_by: "",
      },
      {
        productTypeId: "PRT0000002",
        name: "Desktop",
        is_delete: false,
        updated_by: "",
      },
      {
        productTypeId: "PRT0000003",
        name: "Notebook",
        is_delete: false,
        updated_by: "",
      },
    ];
    for (let i = 0; i < assets.length; i++) {
      assets[i].docType = "product-type";
      await ctx.stub.putState(
        assets[i].productTypeId,
        Buffer.from(JSON.stringify(assets[i]))
      );
    }
    return;
  }

  async createProductType(ctx, productTypeId, name, updated_by) {
    const productType = {
      productTypeId: productTypeId,
      name: name,
      docType: "product-type",
      is_delete: false,
      updated_by: updated_by ? updated_by : "",
    };

    try {
      await ctx.stub.putState(
        productTypeId,
        Buffer.from(JSON.stringify(productType))
      );
      return JSON.stringify(productType);
    } catch (error) {
      throw new Error(error);
    }
  }

  async queryProductType(ctx, productTypeId) {
    const productTypeAsBytes = await ctx.stub.getState(productTypeId);
    if (!productTypeAsBytes || productTypeAsBytes.length === 0) {
      throw new Error(`Product type ${productTypeId} does not exist`);
    }

    try {
      return productTypeAsBytes.toString();
    } catch (error) {
      throw new Error(error);
    }
  }

  async queryAllProductTypes(ctx) {
    const startKey = "";
    const endKey = "";
    const allProductTypes = [];
    for await (const { key, value } of ctx.stub.getStateByRange(
      startKey,
      endKey
    )) {
      const strValue = Buffer.from(value).toString("utf8");
      let record;
      try {
        record = JSON.parse(strValue);
        if (record.docType === "product-type") {
          allProductTypes.push({ Key: key, Value: record });
        }
      } catch (error) {
        throw new Error(error);
      }
    }
    return JSON.stringify(allProductTypes);
  }

  async updateProductType(ctx, productTypeId, name, updated_by) {
    const productTypeAsBytes = await ctx.stub.getState(productTypeId);
    if (!productTypeAsBytes || productTypeAsBytes.length === 0) {
      throw new Error(`Product type ${productTypeId} does not exist`);
    }
    try {
      const productType = JSON.parse(productTypeAsBytes.toString());

      productType.name = name;
      productType.updated_by = updated_by;
      await ctx.stub.putState(
        productTypeId,
        Buffer.from(JSON.stringify(productType))
      );
      return JSON.stringify(productType);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteProductType(ctx, productTypeId, updated_by) {
    const productTypeAsBytes = await ctx.stub.getState(productTypeId);
    if (!productTypeAsBytes || productTypeAsBytes.length === 0) {
      throw new Error(`Product type ${productTypeId} does not exist`);
    }

    try {
      let productType = JSON.parse(productTypeAsBytes.toString());

      productType.is_delete = true;
      productType.updated_by = updated_by;
      await ctx.stub.putState(
        productTypeId,
        Buffer.from(JSON.stringify(productType))
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getProductTypeHistory(ctx, productTypeId) {
    if (productTypeId.length < 1) {
      throw new Error("productTypeId is required as input");
    }

    var orderAsBytes = await ctx.stub.getState(productTypeId);

    if (!orderAsBytes || orderAsBytes.length === 0) {
      throw new Error(
        `Error Message from getProductTypeHistory: Order with productTypeId = ${productTypeId} does not exist.`
      );
    }

    const iterator = await ctx.stub.getHistoryForKey(productTypeId);
    const productTypeHistory = [];

    while (true) {
      let history = await iterator.next();

      if (history.value && history.value.value.toString()) {
        let jsonRes = {};
        jsonRes.TxId = history.value.txId;
        jsonRes.IsDelete = history.value.is_delete
          ? history.value.is_delete.toString()
          : "false";

        var d = new Date(0);
        d.setUTCSeconds(history.value.timestamp.seconds.low);
        jsonRes.Timestamp =
          d.toLocaleString("en-US", { timeZone: "America/Chicago" }) + " CST";

        try {
          jsonRes.Value = JSON.parse(history.value.value.toString("utf8"));
        } catch (err) {
          console.log(err);
          jsonRes.Value = history.value.value.toString("utf8");
        }

        productTypeHistory.push(jsonRes);
      }

      if (history.done) {
        await iterator.close();
        return JSON.stringify(productTypeHistory);
      }
    }
  }
}

module.exports = ProductTypeContract;
