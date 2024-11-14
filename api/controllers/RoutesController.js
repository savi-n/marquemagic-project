/**
 * RoutesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    gst: function(req, res){
        res.view('pages/gst');
    },

    itr: function(req, res){
        res.view('pages/itr');
    },

    aadhar: function(req, res){
        res.view('pages/aadhar');
    }, 
    
    equifax: function(req, res){
        res.view('pages/equifaxnew');
    },

};

