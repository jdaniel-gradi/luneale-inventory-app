# Bonsoirs' Inventory App

## Project context

Basically, the bundle product is a product (set in Shopify product catalog) that includes 3 other products > fitted sheet + duvet cover + pillowcases, i.e. 3 SKUs. We also applied a 10% discount (already included in the price of the bundle). Users are able to select the color and size for each of these 3 products, and the total price changes according to the price of the 3 products. In the cart, users need to see the bundle product + the details of the 3 products (as shown today).

Today, to meet the specs about analytics and stock, Bonsoirs uses a server hosted in Heroku that creates another order immediately after the order placed by the customer. This means that the first order, placed by the customer, contains the bundle product + the 3 SKUs in line-item properties and goes to our logistic supplier (but Shopify does not recognize these SKUs as there are placed in the properties). And the 2nd order contains only the 3 real SKUs recognized by Shopify for the analytics and stock purpose but this order is not visible for the logistic supplier (there is no name, address…). This solution has been developed as this was the only alternative at that time. But today there are too many limits: for instance, it’s not possible to create a back in stock alert on this page, as Shopify does not recognize the SKU within the bundle. With Shopify Plus, we need to build a proper and clean solution that meets theses specs, but without the second fake order.

Also, the client would like to be able to easily reproduce this mechanism for other type of products. For instance, they could create a bundle of 2 towels with a 5% discount. So it would be great to get an easy solution from a UX and tech point of view!

[Monday record](https://gradiweb.monday.com/boards/1314474766/pulses/1585093678)

## Project requirements

- [ ] For each order of a bundle, the bundle product plus the 3 products in it must be deducted from inventory in Shopify.
- [ ] **Shopify Analytics**: Sales of the bundle product and the 3 products in it must be shown in the report. So if a customer placed an order of one *Parure Percale de coton*, in the analytics we need to see 1 quantity of *Parure Percale de coton* + 1 *Drap housse Percale de coton* + 1 *Housse de couette Percale de coton* + 1 *Taies d’oreiller Percale de coton*.
- [ ] The 3 SKUs of the bundle product must be forwarded to logistics in the line-item properties of the order with the tag "_SKU:".