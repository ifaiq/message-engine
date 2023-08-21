/**
 * Creates a shopping cart for the user.
 * @module
 */

import ShoppingCart from '../shoppingCart.js';

async function createUserShoppingCart(userID) {
    const shoppingCart = new ShoppingCart({ user: userID, items: [] });
    await shoppingCart.save();
}

export default createUserShoppingCart;
