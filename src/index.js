document.addEventListener('DOMContentLoaded', () => {
    const quoteList = document.querySelector('div ul#quote-list')
    const form = document.querySelector('form#new-quote-form')
    let currentId = 1
    let currentLikes = 0
    
    fetch('http://localhost:3000/quotes?_embed=likes')
    .then(response => response.json())
    .then(data => {
        for(const quoteObj of data) {
            createQuote(quoteObj)
            
            currentId ++
        }
    })
    .catch(() => alert('There was an error with the GET request.'))

    const body = document.querySelector('body')
    const sort = document.createElement('button')
    sort.textContent = 'Turn Sort ON'
    sort.addEventListener('click', () => {        
        if(sort.textContent === 'Turn Sort ON') {
            fetch('http://localhost:3000/quotes?_sort=author')
            .then(response => response.json())
            .then(data => {
                quoteList.textContent = ''
                for(const quoteObj of data) {
                    createQuote(quoteObj)
                }
            })
            .catch(() => alert('There was an error with the GET request.'))
            
            sort.textContent = 'Turn Sort OFF'
        } else {
            fetch('http://localhost:3000/quotes?_sort=id')
            .then(response => response.json())
            .then(data => {
                quoteList.textContent = ''
                for(const quoteObj of data) {
                    createQuote(quoteObj)
                }
            })
            .catch(() => alert('There was an error with the GET request.'))
            
            sort.textContent = 'Turn Sort ON'
        }
    })
    body.insertBefore(sort, body.children[1])

    const createQuote = function (quoteObj) {
        const quoteCard = document.createElement('li')
        quoteCard.className = 'quote-card'

        const blockquote = document.createElement('blockquote')
        blockquote.className = 'blockquote'

        const quote = document.createElement('p')
        quote.className = 'mb-0'
        quote.textContent = quoteObj.quote

        const author = document.createElement('footer')
        author.className = 'blockquote-footer'
        author.textContent = quoteObj.author

        const editForm = document.createElement('form')
        editForm.hidden = true
        const editInput = document.createElement('input')
        const editSubmit = document.createElement('button')
        editSubmit.textContent = 'Submit Changes'
        editForm.append(editInput, editSubmit)
        editForm.addEventListener('submit', event => {
            event.preventDefault()

            fetch(`http://localhost:3000/quotes/${quoteObj.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    quote: event.target[0].value
                })
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(() => alert('There was an error with the PATCH request.'))

            quote.textContent = event.target[0].value
        })

        const lineBreak = document.createElement('br')

        const likeButton = document.createElement('button')
        likeButton.className = 'btn-success'
        likeButton.innerHTML = 'Likes: <span>0</span>'
        const span = likeButton.querySelector('span')

        fetch('http://localhost:3000/likes')
        .then(response => response.json())
        .then(data => {
            currentLikes = 0
            for(const like of data) {
                if(like.quoteId === quoteObj.id) {
                    currentLikes ++
                }
            }
            span.textContent = currentLikes
        })

        likeButton.addEventListener('click', () => {
            fetch(`http://localhost:3000/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    quoteId: quoteObj.id,
                    createdAt: Math.round(Date.now() / 1000)
                })
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(() => alert('There was an error with the POST request.'))

            currentLikes = parseInt(span.textContent)
            span.textContent = ++ currentLikes

        })

        const deleteButton = document.createElement('button')
        deleteButton.className = 'btn-danger'
        deleteButton.textContent = 'Delete'
        deleteButton.addEventListener('click', () => {
            fetch(`http://localhost:3000/quotes/${quoteObj.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(() => alert('There was an error with the DELETE request.'))

            quoteCard.remove()

            currentId --
        })

        const editButton = document.createElement('button')
        editButton.textContent = 'Edit Quote'
        editButton.addEventListener('click', () => {
            if(editForm.hidden) {
                editForm.hidden = false
            } else {
                editForm.hidden = true
            }
        })

        blockquote.append(quote, author, editForm, lineBreak, likeButton, deleteButton, editButton)
        quoteCard.appendChild(blockquote)
        quoteList.append(quoteCard)
    }

    form.addEventListener('submit', event => {
        event.preventDefault()
        
        const newQuoteObj = {
            id: currentId,
            quote: event.target[0].value,
            author: event.target[1].value
        }

        fetch('http://localhost:3000/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newQuoteObj)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(() => alert('There was an error with the POST request.'))

        createQuote(newQuoteObj)

        currentId ++
    })
})