# btmhub_assignment
Boxed Chocolate Online Shop - Technical Interview Assignment for BTM Hub

As I have been short on time for this assignment (as I'm still travelling on work), I have tried to do as much as I possibly can prior to the deadline this morning.

The necessary tables for the assignment can be generated using the following SQL:

CREATE TABLE `chocolates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `brand` varchar(60) NOT NULL,
  `origin_country` varchar(60) DEFAULT NULL,
  `cocoa_content` double DEFAULT NULL,
  `alcohol_content` double DEFAULT NULL,
  `unit_price` double DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `stock_left` int(11) NOT NULL,
  PRIMARY KEY (`id`,`name`,`brand`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;


CREATE TABLE `sellers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passport` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `contact_number` varchar(45) DEFAULT NULL,
  `password` binary(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

Sellers can register, and login; once logged in they can add, edit & remove chocolates, as well as maintain their stock count for each chocolate.

Customers can add chocolates they desire directly from the homepage, to their cart; clicking the cart, then allows them to checkout and complete the transaction, and also decrement the chocolate stock count, accordingly.

I didn't have the time to complete image upload for each chocolate added by the seller.

I have used HTML / CSS (Bootstrap) / Handlebars / Webpack / NodeJS / Express & MySQL.
