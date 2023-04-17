const Category = require("../model/Category/Category");
const { appErr } = require("../utility/appErr");

const createCategoryController = async (req, res, next) => {
    const { title } = req.body;
   try {
    const category = await Category.create({title, user: req.userAuth});
    res.json(({
        status: 'success',
        data: category
    }));
    } catch (error) {
        next(appErr(error.message));
    }
};

const categoryDetailsController = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
     res.json(({
         status: 'success',
         data: category
     }));
     } catch (error) {
         next(appErr(error.message));
     }
 };

 const allCategoriesController = async (req, res, next) => {
    try {
        const categories = await Category.find();
     res.json(({
         status: 'success',
         data: categories
     }));
     } catch (error) {
         next(appErr(error.message));
     }
 };

 const deleteCategoryController = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
     res.json(({
         status: 'success',
         data: "Category deleted!"
     }));
     } catch (error) {
         next(appErr(error.message));
     }
 };

 const editCategoryController = async (req, res, next) => {
    const {title} = req.body;
    try {
        const category = await Category.findByIdAndUpdate(req.params.id,{
            title
        },{
            new: true,
            runValidators: true
        })
     res.json(({
         status: 'success',
         data: category
     }));
     } catch (error) {
         next(appErr(error.message));
     }
 };

 module.exports = {
    createCategoryController,
    categoryDetailsController,
    deleteCategoryController,
    editCategoryController,
    allCategoriesController
 }