const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

//get all countries
router.get('/countries',authorize,async(req,res)=>{
    try{
        const q = `SELECT DISTINCT country_name FROM location`;
        pool.query(q, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Get all cities within the country
router.get('/cities/:country',authorize,async(req,res)=>{
    try{
        const country=req.params.country;
        const q = `SELECT DISTINCT city_name FROM location WHERE country_name=$1`;
        pool.query(q, [country], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// get city and country_name given location_id
router.get('/:location_id',authorize,async(req,res)=>{
    try{
        const location_id=req.params.location_id;
        const q = `SELECT city_name, country_name FROM location WHERE location_id=$1`;
        pool.query(q, [location_id], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data.rows[0]);
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports=router;