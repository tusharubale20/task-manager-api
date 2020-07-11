const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { compare } = require('bcryptjs')
const router = new express.Router()

router.post('/tasks', auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)    
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req,res) => {
    try {
        const match = {}
        const sort = {}

        // using match const to check if query param has completed passed as an argument
        // and then to fetch tasks basis of matching completed value
        if(req.query.completed) {
            match.completed = req.query.completed === 'true' 
        }

        if(req.query.sortBy) {
            const parts = req.query.sortBy.split('_')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch(e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id
    
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send('No such task found')
        } 
        res.send(task)
    }catch(e) {
        console.log(e)
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['description','completed']
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update))
    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Update in request body'})
    }

    try {
        const task = await Task.findOne( {_id: req.params.id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        //const task = await Task.findByIdAndDelete(req.params.id)
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router