'use strict';

const { Contract } = require('fabric-contract-api');

class Manufacturer extends Contract {
    async initManufacturer(ctx) {
        return;
    }

    async createManufacturer(ctx, manufactororId, name) {
        const manufacturer = {
            manufactororId: manufactororId,
            name: name,
            docType: 'manufacturer'
        }

        try {
            await ctx.stub.putState(manufactororId, Buffer.from(JSON.stringify(manufacturer)));
            return JSON.stringify(manufacturer);
        } catch (error) {
            throw new Error(error);
        }
    }

    async queryManufacturer(ctx, manufactororId) {
        const manufacturerAsBytes = await ctx.stub.getState(manufactororId);
        if (!manufacturerAsBytes || manufacturerAsBytes.length === 0) {
            throw new Error(`${manufactororId} does not exist`);
        }
        return manufacturerAsBytes.toString();
    }

    async queryAllManufactureres(ctx) {
        const startKey = '';
        const endKey = '';
        const allManufactureres = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.docType === 'manufacturer') {
                    allManufactureres.push({ Key: key, Value: record });
                }
            } catch (error) {
                throw new Error(error);
            }
        }
        return JSON.stringify(allManufactureres);
    }

    async updateManufacturer(ctx, manufactororId, name) {
        const manufacturerAsBytes = await ctx.stub.getState(manufactororId);
        if (!manufacturerAsBytes || manufacturerAsBytes.length === 0) {
            throw new Error(`${manufactororId} does not exist`);
        }

        const manufacturer = JSON.parse(manufacturerAsBytes.toString());
        manufacturer.name = name;

        try {
            await ctx.stub.putState(manufactororId, Buffer.from(JSON.stringify(manufacturer)));
            return JSON.stringify(manufacturer);
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteManufacturer(ctx, manufactororId) {
        const manufacturerAsBytes = await ctx.stub.getState(manufactororId);
        if (!manufacturerAsBytes || manufacturerAsBytes.length === 0) {
            throw new Error(`${manufactororId} does not exist`);
        }
        try {
            await ctx.stub.deleteState(manufactororId);
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = Manufacturer;