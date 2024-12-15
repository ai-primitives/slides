import React from 'react'
import { Deck, Slide } from 'spectacle'
import type { Fixture } from 'react-cosmos/react'

const ExampleFixture: Fixture = {
  component: Deck,
  name: 'Example Deck',
  render: () => (
    <Deck>
      <Slide>
        <h1>Hello, Spectacle!</h1>
      </Slide>
    </Deck>
  ),
}

export default ExampleFixture
