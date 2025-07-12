drop table if exists deliveryUpdates;
drop table if exists ratings;
drop table if exists orderItems;
drop table if exists orders;
drop table if exists menuItems;
drop table if exists restaurants;
drop table if exists deliveryWorkers;
drop table if exists restaurantAdmins;
drop table if exists customers;

create table customers (
  customerId int identity(1,1) primary key,
  userName varchar(50) not null,
  email varchar(50) unique not null,
  password varchar(255) not null,
  createDate date default getdate(),
   Disablebit bit default 'false'
);

create table restaurantAdmins (
  adminId int identity(1,1) primary key,
  userName varchar(50) unique not null,
  email varchar(50) unique not null,
  password varchar(255) not null,
  createDate date default getdate(),
  statusApprove bit default 'false',
  Disablebit bit default 'false'
);

create table deliveryWorkers (
  riderId int identity(1,1) primary key,
  userName varchar(50) unique not null,
  email varchar(50) unique not null,
  password varchar(255) not null,
  createDate date default getdate(),
  statusApprove bit default 'false',
  Disablebit bit default 'false'
);

create table restaurants (
  restaurantId int identity(1,1) primary key,
  name varchar(50) unique not null,
  address varchar(150) not null,
  contactNumber varchar(20) not null,
  adminId int references restaurantAdmins(adminId) on delete set null,
  imageUrl varchar(255) null,
  statusApprove bit default 'false',
  Disablebit bit default 'false'
);

create table menuItems (
  itemId int identity(1,1) primary key,
  name varchar(50) not null,
  description varchar(150),
  price decimal(10,2) check (price > 0),
  restaurantId int references restaurants(restaurantId) on delete cascade,
  imageUrl varchar(255) null,
  Disablebit bit default 'false'
);

create table orders (
  orderId int identity(1,1) primary key,
  customerId int null references customers(customerId) on delete set null,
  restaurantId int null references restaurants(restaurantId) on delete set null,
  statusOrder varchar(50) check (statusOrder in ('pending', 'in progress', 'delivered', 'cancelled')) default 'pending',
  totalAmount decimal(10,2) check (totalAmount >= 0),
  orderDate datetime default getdate(),
  deliveryRiderId int null references deliveryWorkers(riderId) on delete set null,
  deliveryAddress varchar(150) not null
);



create table orderItems (
  orderItemId int identity(1,1) primary key,
  orderId int not null references orders(orderId) on delete cascade,
  itemId int not null references menuItems(itemId) on delete cascade,
  quantity int check (quantity > 0),
  subtotal decimal(10,2) check (subtotal >= 0)	
);

create table ratings (
  ratingId int identity(1,1) primary key,
  customerId int null references customers(customerId) on delete cascade,
  restaurantId int null references restaurants(restaurantId) on delete cascade,
  rating int check (rating between 1 and 5),
  review varchar(150),
  createDate datetime default getdate()
);

create table deliveryUpdates (
  updateId int identity(1,1) primary key,
  orderId int not null references orders(orderId) on delete cascade,
  status varchar(20) check (status in ('pending','picked up', 'on the way', 'delivered')) default 'pending'
);


-- Insert Customers
INSERT INTO customers (userName, email, password) VALUES
('john_doe', 'john@example.com', 'password123'),
('alice_smith', 'alice@example.com', 'securePass!'),
('bob_jones', 'bob@example.com', 'bobSecure45'),
('charlie_m', 'charlie@example.com', 'charlie123!'),
('emma_wat', 'emma@example.com', 'emmaStrong99');

-- Insert Restaurant Admins
INSERT INTO restaurantAdmins (userName, email, password, statusApprove) VALUES
('admin_pizza', 'admin_pizza@example.com', 'adminPass1', 1),
('admin_burger', 'admin_burger@example.com', 'adminPass2', 1),
('admin_asian', 'admin_asian@example.com', 'adminPass3', 1),
('admin_italian', 'admin_italian@example.com', 'adminPass4', 1),
('admin_desserts', 'admin_desserts@example.com', 'adminPass5', 1);

-- Insert Delivery Workers
INSERT INTO deliveryWorkers (userName, email, password, statusApprove) VALUES
('rider_james', 'james_rider@example.com', 'riderPass1', 1),
('rider_lisa', 'lisa_rider@example.com', 'riderPass2', 1),
('rider_mike', 'mike_rider@example.com', 'riderPass3', 1),
('rider_sophia', 'sophia_rider@example.com', 'riderPass4', 1),
('rider_daniel', 'daniel_rider@example.com', 'riderPass5', 1);

-- Insert Restaurants
INSERT INTO restaurants (name, address, contactNumber, adminId, statusApprove) VALUES
('Pizza Palace', '123 Pizza St', '123-456-7890', 1, 1),
('Burger Haven', '456 Burger Ave', '987-654-3210', 2, 1),
('Asian Delight', '789 Sushi Blvd', '555-123-4567', 3, 1),
('Italian Feast', '321 Pasta Ln', '444-555-6666', 4, 1),
('Sweet Treats', '654 Dessert Rd', '222-333-4444', 5, 1);

-- Insert Menu Items
INSERT INTO menuItems (name, description, price, restaurantId) VALUES
('Margherita Pizza', 'Classic tomato and cheese pizza', 9.99, 1),
('Pepperoni Pizza', 'Spicy pepperoni with extra cheese', 12.99, 1),
('Cheeseburger', 'Juicy beef patty with cheddar', 8.99, 2),
('Double Burger', 'Two beef patties with special sauce', 11.99, 2),
('Sushi Roll', 'Fresh salmon and avocado', 14.99, 3),
('Chicken Teriyaki', 'Grilled chicken with teriyaki sauce', 13.50, 3),
('Pasta Carbonara', 'Creamy pasta with bacon', 10.99, 4),
('Lasagna', 'Layers of pasta and cheese', 12.50, 4),
('Chocolate Cake', 'Rich dark chocolate cake', 6.99, 5),
('Strawberry Cheesecake', 'Classic cheesecake with strawberries', 7.50, 5);

-- Insert Orders
INSERT INTO orders (customerId, restaurantId, statusOrder,totalAmount, deliveryRiderId, deliveryAddress) VALUES
(1, 1, 'pending',1000,1,'123 Pizza St'),
(2, 2, 'delivered',1500,3,'456 Burger Ave'),
(3, 3, 'in progress',200,3,'789 Sushi Blvd'),
(4, 4, 'pending',100,2,'321 Pasta Ln'),
(1, 3, 'delivered',1000,4,'789 Sushi Blvd'),
(2, 1, 'pending',300,5,'123 Pizza St'),
(4, 4, 'delivered',350,2,'321 Pasta Ln');

INSERT INTO orders (customerId, restaurantId, statusOrder, deliveryAddress) VALUES
(3, 2, 'in progress','456 Burger Ave'),
(5, 5, 'cancelled','654 Dessert Rd'),
(5, 5, 'pending', '654 Dessert Rd');

-- Insert Order Items
INSERT INTO orderItems (orderId, itemId, quantity, subtotal) VALUES
(5, 3, 2, 13.98),
(1, 1, 2, 19.98),
(2, 3, 2, 17.98),
(3, 5, 1, 14.99),
(4, 7, 2, 21.98),
(5, 9, 2, 13.98),
(6, 6, 1, 13.50),
(7, 2, 1, 12.99),
(8, 4, 1, 11.99),
(9, 8, 1, 12.50),
(10, 10, 2, 15.00);

-- Insert Ratings
INSERT INTO ratings (customerId, restaurantId, rating, review) VALUES
(1, 1, 5,'Delicious pizza!'),
(2, 2, 4, 'Great burgers but a bit slow'),
(3, 3, 5, 'Best sushi in town!'),
(4, 4, 3, 'Pasta was okay, nothing special'),
(5, 5, 2, 'Cake was dry and overpriced'),
(1, 3, 5, 'Loved the teriyaki chicken!'),
(2, 1, 4, 'Cheesy pizza, just how I like it'),
(3, 2, 3, 'Burger was good but fries were soggy'),
(4, 4, 4, 'Lasagna was delicious!'),
(5, 5, 5, 'Cheesecake was heavenly!');

-- Insert Delivery Updates
INSERT INTO deliveryUpdates (orderId, status) VALUES
(1, 'pending'),
(2, 'delivered'),
(3, 'on the way'),
(4, 'pending'),
(6, 'delivered'),
(7, 'picked up'),
(8, 'on the way'),
(9, 'delivered'),
(10, 'pending');


--select* from Customers
--select* from RestaurantAdmins
--select* from DeliveryWorkers

--select* from Restaurants
--select* From MenuItems
--select* from Orders
--select* from OrderItems

--select* from Ratings
--select* from DeliveryUpdates

----///ADMIN CONSOLE\\\

--1a) Display All Users
go
create procedure Display_users
as 
begin 
select * from customers where Disablebit='false'
select* from restaurantAdmins where Disablebit='false'
select* from deliveryWorkers where Disablebit='false'
end

exec Display_users

--1b) 
go
create view  Display_all_approved_restaurant_admins
as
select * from restaurantAdmins where statusApprove=1 and Disablebit='false'

select * from  Display_all_approved_restaurant_admins

--1c) 
go
create view Display_all_approved_delivery_riders
as
select * from deliveryWorkers where statusApprove=1 and Disablebit='false'
select * from Display_all_approved_delivery_riders

--2a approve status of restaurant admin 
create procedure update_radmin_status  
@admin_id int  
as  
begin  
if not exists (select 1 from restaurantadmins where adminid = @admin_id)  
begin  
print 'admin does not exist'  
return  
end  
update restaurantadmins  
set statusapprove = 1  
where adminid = @admin_id
print 'admin status updated successfully'  
end

select*from restaurantAdmins
exec update_radmin_status @admin_id=5
select*from restaurantAdmins

--2b  approve status of restaurant admin 
drop procedure update_deliveryworker_status
create procedure update_deliveryworker_status  
@rider_id int  
as  
begin  
if not exists (select 1 from deliveryworkers where riderid = @rider_id)  
begin  
print 'rider does not exist';  
return  
end  
update deliveryworkers  
set statusapprove = 1  
where riderid = @rider_id
print 'rider status updated successfully'
end

select*from deliveryWorkers
exec update_deliveryworker_status @rider_id=4
select*from deliveryWorkers

--3a
go
create procedure remove_admin  
@admin_id int  
as  
begin    
if not exists (select 1 from restaurantadmins where adminid = @admin_id)  
begin  
print 'admin does not exist'
return
end  
update restaurantadmins  
set statusapprove = 0  , Disablebit='true'
where adminid = @admin_id 
print 'admin removed successfully'  
end

exec remove_Admin @admin_id =1
select * from restaurantAdmins where Disablebit='false'

--3b Remove Rider
go
create procedure remove_rider  
@rider_id int  
as  
begin  
if not exists (select 1 from deliveryWorkers where riderId = @rider_id)  
begin  
print 'rider does not exist'  
return  
end  
if not exists (  select 1 from deliveryWorkers  
join orders on deliveryWorkers.riderId = orders.deliveryRiderId  
and deliveryRiderId = @rider_id  
where statusOrder <> 'Delivered'  )  
begin  
update deliveryWorkers  
set statusApprove = 0 , disableBit='true' 
where riderId = @rider_id  
print 'rider deleted'  
end  
else  
begin  
print 'rider has not yet delivered the order, so cannot delete'  
end  
end  

exec remove_rider @rider_id=4
select *from deliveryWorkers where Disablebit='false'


--4) insert new restaurant
go
create procedure new_restaurant
@name varchar(50), 
@address varchar(50), 
@contact int
as 
begin 
insert into restaurants (name, address, contactnumber) 
values (@name, @address, @contact)
end
select * from restaurants where Disablebit = 'false'


--5 assign_new_admin_restaurant
go
create procedure assign_admin_to_restaurant
@restaurantid int, @adminid int
as
begin
if   exists (select 1 from restaurantadmins where adminid = @adminid)
and exists (select 1 from restaurants where restaurantid = @restaurantid and restaurants.adminId is null)
and not exists (select 1 from restaurants where restaurants.adminId = @adminid)
begin
update restaurants set adminid = @adminid where restaurantid = @restaurantid
print 'admin assigned successfully'end
else
begin print 'invalid restaurant or admin' end
end

exec assign_admin_to_restaurant @restaurantid=7,@adminid=4

--6
create view Restaurant_income
as
select 
r.restaurantid, 
r.name as restaurantname, 
sum(o.totalamount) as totalincome
from restaurants r left join orders o on r.restaurantid = o.restaurantid and o.statusorder = 'delivered'
group by r.restaurantid, r.name

drop view Restaurant_income
select*from Restaurant_income
order by totalincome desc

--7-Get  all Restaurant Earnings By Date
declare @startDate DATE
set @startDate ='2025-01-01'
declare   @endDate DATE
set @endDate ='2025-03-31'
SELECT  r.name AS restaurantName, SUM(o.totalAmount) AS totalIncome
FROM restaurants r left JOIN orders o ON r.restaurantId = o.restaurantId and o.statusOrder = 'delivered' 
and o.orderDate BETWEEN @startDate AND @endDate
GROUP BY r.restaurantId, r.name
ORDER BY totalIncome DESC;  


select* from customers
print getdate()
--8 All acounts created today
go
create view All_acounts_created_today
as
select * 
from customers
where cast(createdate as date) = cast(getdate() as date)
select * from All_acounts_created_today
--

--Delete Restaurant
update restaurants set Disablebit='true' where restaurantId=1;

----///RESTAURANT ADMIN CONSOLE\\\
--1-Add new item to menue
go
	CREATE PROCEDURE AddMenuItem
    @name VARCHAR(50),
    @description VARCHAR(150),
    @price DECIMAL(10,2),
    @restaurantId INT,
    @imageUrl VARCHAR(255) = NULL
AS
BEGIN
	if exists(select* from menuItems where name=@name and restaurantId=@restaurantId)
	begin
		return
	end
    INSERT INTO menuItems (name, description, price, restaurantId, imageUrl)
    VALUES (@name, @description, @price, @restaurantId, @imageUrl);
END;

EXEC AddMenuItem 
    @name = 'Chicken Biryani', 
    @description = 'Spicy and flavorful rice dish', 
    @price = 350, 
    @restaurantId = 1, 
    @imageUrl = NULL;


--2)
go
CREATE PROCEDURE UpdateMenuItemPrice
	@restaurantId int,
    @itemId INT,
    @newPrice DECIMAL(10,2)
AS
BEGIN
    UPDATE menuItems
    SET price = @newPrice
    WHERE itemId = @itemId and Disablebit=0 and restaurantId=@restaurantId;
END;

EXEC UpdateMenuItemPrice 
	@restaurantId=1,
    @itemId = 1, 
    @newPrice = 375.00;

--3-Remove Menu Item
go
CREATE PROCEDURE DisableMenuItem
	@restaurantId int,
    @itemId INT
AS
BEGIN
    UPDATE menuItems
    SET Disablebit = 1
    WHERE itemId = @itemId and restaurantId=@restaurantId;
END;

EXEC DisableMenuItem 
    @restaurantId=1 ,@itemId = 1;

--4-Update Order Status
go
CREATE PROCEDURE UpdateOrderStatus
	@restaurantId int,
    @orderId INT,
    @newStatus VARCHAR(50) 
AS
BEGIN
    UPDATE orders
    SET statusOrder = @newStatus
    WHERE orderId = @orderId and restaurantId=@restaurantId; 
END;
EXEC UpdateOrderStatus 
	@restaurantId=1,
    @orderId = 1001, 
    @newStatus = 'delivered';

--5-Total Earnings
go
CREATE PROCEDURE GetTotalEarnings (@RestaurantId INT)
AS
BEGIN
    SELECT 
        r.restaurantId, 
        r.name AS restaurantName, 
        SUM(o.totalAmount) AS totalIncome
    FROM 
        restaurants r
    JOIN 
        orders o ON r.restaurantId = o.restaurantId
    WHERE 
        o.statusOrder = 'delivered' 
        AND r.restaurantId = @RestaurantId  
    GROUP BY 
        r.restaurantId, r.name
    HAVING 
        SUM(o.totalAmount) > 0  
    ORDER BY 
        totalIncome DESC;  
END;
drop procedure GetTotalEarnings

EXEC GetTotalEarnings 
    @RestaurantId = 1;


--6-Popular Item
go
CREATE PROCEDURE GetTopSellingMenuItems(@restaurantId int)
AS
BEGIN
    SELECT TOP 1  
        m.itemId, 
        m.name AS itemName, 
        SUM(oi.quantity) AS totalQuantitySold,
        SUM(oi.subtotal) AS totalRevenue
    FROM 
        menuItems m
    JOIN 
        orderItems oi ON m.itemId = oi.itemId and restaurantId=@restaurantId
    JOIN 
        orders o ON oi.orderId = o.orderId and o.restaurantId=@restaurantId
    WHERE 
        o.statusOrder = 'delivered' and m.Disablebit = 0
    GROUP BY 
        m.itemId, m.name
    ORDER BY 
        totalQuantitySold DESC
END;

EXEC GetTopSellingMenuItems 2;


--7-Get Restaurant Earnings By Date
go
CREATE PROCEDURE GetRestaurantEarningsByDate
    @restaurantId INT,
    @startDate DATE,
    @endDate DATE
AS
BEGIN
    SELECT 
        r.restaurantId, 
        r.name AS restaurantName, 
        SUM(o.totalAmount) AS totalIncome
    FROM 
        restaurants r
    JOIN 
        orders o ON r.restaurantId = o.restaurantId
    WHERE 
        o.statusOrder = 'delivered' 
        AND r.restaurantId = @restaurantId  
        AND o.orderDate BETWEEN @startDate AND @endDate
    GROUP BY 
        r.restaurantId, r.name
    HAVING 
        SUM(o.totalAmount) > 0  
    ORDER BY 
        totalIncome DESC;  
END;
EXEC GetRestaurantEarningsByDate 
    @restaurantId = 2, 
    @startDate = '2025-01-01', 
    @endDate = '2025-03-31';

--8-Get Restaurant MenuItems(All)
CREATE PROCEDURE GetRestaurantMenuItems
    @restaurantId INT
AS
BEGIN
    SELECT distinct
        m.itemId, 
        m.name, 
        m.description, 
        m.price, 
        m.Disablebit
    FROM 
        menuItems m
    WHERE 
        m.restaurantId = @restaurantId and m.Disablebit=0
    ORDER BY 
        m.name;
END;
EXEC   GetRestaurantMenuItems 
    @restaurantId = 1;

--9-Get Restaurant Order History for admin
	CREATE PROCEDURE GetRestaurantOrderHistory
    @restaurantId INT
AS
BEGIN
    SELECT 
        o.orderId, 
        o.customerId, 
        o.statusOrder, 
        o.totalAmount, 
        o.orderDate
    FROM 
        orders o
    WHERE 
        o.restaurantId = @restaurantId
    ORDER BY 
        o.orderDate DESC;
END;
EXEC GetRestaurantOrderHistory @restaurantId = 2;

--VIEWS--

--1-Customer Details View
go
CREATE VIEW RestaurantCustomerDetails AS
SELECT 
    r.restaurantId,
    r.name AS restaurantName,
    c.customerId,
    c.userName AS customerName,
    c.email AS customerEmail,
    c.createDate AS customerSince
FROM 
    restaurants r
JOIN 
    orders o ON r.restaurantId = o.restaurantId
JOIN 
    customers c ON o.customerId = c.customerId
GROUP BY 
    r.restaurantId, r.name, c.customerId, c.userName, c.email, c.createDate;

	SELECT * FROM RestaurantCustomerDetails where restaurantId=1 ;

	--2-Restaurant Avg Rating
	CREATE VIEW RestaurantAvgRating AS
SELECT 
    r.restaurantId,
    r.name AS restaurantName,
    COUNT(rt.ratingId) AS totalReviews,
    AVG(CAST(rt.rating AS DECIMAL(10,2))) AS avgRating
FROM 
    restaurants r
LEFT JOIN 
    ratings rt ON r.restaurantId = rt.restaurantId
GROUP BY 
    r.restaurantId, r.name;
	SELECT * FROM RestaurantAvgRating WHERE restaurantId = 1;
	SELECT * FROM RestaurantAvgRating

	--3-Pending Orders
	CREATE VIEW PendingOrders AS
SELECT 
    o.orderId,
    o.customerId,
    o.restaurantId,
    o.statusOrder,
    o.totalAmount,
    o.orderDate,
    o.deliveryRiderId,
    o.deliveryAddress
FROM 
    orders o
WHERE 
    o.statusOrder = 'pending';

		go
	declare @restaurantId int=1
	SELECT * FROM PendingOrders where restaurantId=@restaurantId;

	--4-Orders Without Rider
	CREATE VIEW OrdersWithoutRider AS
SELECT 
    o.orderId,
    o.customerId,
    o.restaurantId,
    o.statusOrder,
    o.totalAmount,
    o.orderDate,
    o.deliveryRiderId,
    o.deliveryAddress
FROM 
    orders o
WHERE 
    o.deliveryRiderId IS NULL
    AND o.statusOrder NOT IN ('delivered', 'cancelled');

	SELECT * FROM OrdersWithoutRider;

	--5- menue items without Description
	CREATE VIEW MenuItemsForDescriptionUpdate AS
SELECT 
    itemId, 
    name, 
    description
FROM 
    menuItems
WHERE 
    description IS NULL OR description = '' and menuItems.Disablebit=0; 

	SELECT * FROM MenuItemsForDescriptionUpdate

	--6-Restaurant Overview
	CREATE VIEW RestaurantOverview AS
SELECT 
    r.restaurantId,
    r.name AS restaurantName,
    COUNT(o.orderId) AS totalOrders,
    ISNULL(SUM(o.totalAmount), 0) AS totalEarnings,
    COUNT(rt.ratingId) AS totalReviews,
    ISNULL(AVG(CAST(rt.rating AS DECIMAL(10,2))), 0) AS avgRating
FROM 
    restaurants r
LEFT JOIN 
    orders o ON r.restaurantId = o.restaurantId
LEFT JOIN 
    ratings rt ON r.restaurantId = rt.restaurantId
GROUP BY 
    r.restaurantId, r.name;
	SELECT * FROM RestaurantOverview where restaurantId=1

	
	--7-Track Order Progress
	CREATE VIEW TrackOrderProgress AS
SELECT 
    o.orderId,
    o.restaurantId,
    r.name AS restaurantName,
    o.statusOrder,
    o.orderDate,
    o.deliveryRiderId,
    dw.userName AS riderName
FROM 
    orders o
JOIN 
    restaurants r ON o.restaurantId = r.restaurantId
LEFT JOIN 
    deliveryWorkers dw ON o.deliveryRiderId = dw.riderId;

	SELECT * FROM TrackOrderProgress WHERE restaurantId = 1;

	--8-Customer Feedback
	
	CREATE VIEW RestaurantCustomerFeedback AS
SELECT 
    rt.ratingId,
    rt.restaurantId,
    r.name AS restaurantName,
    rt.customerId,
    c.userName AS customerName,
    rt.rating,
    rt.review,
    rt.createDate
FROM 
    ratings rt
JOIN 
    restaurants r ON rt.restaurantId = r.restaurantId
JOIN 
    customers c ON rt.customerId = c.customerId
	where c.Disablebit='false';

	SELECT * FROM RestaurantCustomerFeedback WHERE restaurantId = 1;


----///CUSTOMER CONSOLE\\\

--1) Viewing Order History
go
create view orderHistory as
select O.orderID, customerID, O.restaurantID, R.Name Restaurant, MI.name Item, OI.subtotal
from orders O join restaurants R on O.restaurantId=R.restaurantId
join orderItems OI on OI.orderId=O.orderId join menuItems MI on MI.itemId=OI.itemId
where statusOrder = 'delivered'

declare @customerId int = 1
select* from orderHistory where customerId=@customerId 

--2) Show all Restaurants to Choose from
select* from restaurants where disableBit= 'false'

--3) Show all MenuItems of a Restaurant
declare @restaurantId int =1;

select * from menuItems where restaurantId=@restaurantId and Disablebit='false'

--4) Placing an Order
go
create procedure placingOrder
    @customerid int, @restaurantid int, @deliveryaddress varchar(150), @itemid int, @quantity int, @orderid int output
as
begin
    declare @existingorderid int, @subtotal decimal(10,2);

    select @existingorderid = orderid 
    from orders 
    where customerid = @customerid and statusorder !='delivered' and statusOrder!= 'cancelled';

    if @existingorderid is not null
    begin
        print 'customer already has a pending order';
        return;
    end


    insert into orders (customerid, restaurantid, statusorder, totalamount, orderdate, deliveryaddress)
    values (@customerid, @restaurantid, 'pending', 0, getdate(), @deliveryaddress);
    
    set @orderid = scope_identity();

    select @subtotal = price * @quantity from menuitems where itemid = @itemid;

    insert into orderitems (orderid, itemid, quantity, subtotal)
    values (@orderid, @itemid, @quantity, @subtotal);

    update orders set totalamount = @subtotal where orderid = @orderid;

    print 'order placed successfully with order id: ' + cast(@orderid as varchar);
end;
DECLARE @newOrderId int;
exec placingorder 4, 2, 'Milad Street', 5, 2, @newOrderId output; --to place more orders
select @newOrderId

--5) Input Rating
go
create procedure inputRating
 @customerid int, @restaurantid int, @rating int, @review varchar(100)
 as begin
	if not exists (SELECT *
        FROM orders 
        WHERE customerId = @customerId AND restaurantId = @restaurantId AND statusOrder = 'delivered')
		begin
		return
		end

		insert into Ratings (customerId, restaurantId, rating, review) values 
(@customerID, @restaurantID, @rating, @review);

 end

go
declare @customerID int=1, @restaurantID int = 3, @rating int = 4, @review varchar(100)='Amazing';
exec inputRating @customerId, @restaurantId, @rating, @review

--6) View Customer Details
go
create view customerDetails as
select customerId, username, email, createDate from customers

declare @customerId int =1
select * from customerDetails where customerId=@customerId

--7) Cancel Order
go
create procedure cancelorder
    @customerid int,
    @orderid int
as
begin
    if not exists (select 1 from orders where orderid = @orderid and customerid = @customerid)
    begin
        print 'order not found';
        return;
    end
    declare @statusorder varchar(50);
    select @statusorder = statusorder from orders where orderid = @orderid;

    if @statusorder = 'delivered'
    begin
        print 'order already delivered, cannot be cancelled';
        return;
    end
    
    if @statusorder = 'cancelled'
    begin
        print 'order already cancelled';
        return;
    end
    
    update orders set statusorder = 'cancelled' where orderid = @orderid and customerid = @customerid;
    print 'order cancelled successfully';
end;

exec cancelorder 1, 1

--8) Track Order Status
go
create procedure trackorder
    @customerId int,
    @orderid int
as
begin
    if not exists (select 1 from orders where orderid = @orderid and @customerId = customerId)
    begin
        print 'order not found';
        return;
    end

    declare @statusorder varchar(50);
    select @statusorder = statusorder from orders where orderid = @orderid and @customerId=customerid;

    declare @deliveryupdate varchar(50);
    select @deliveryupdate = status from deliveryupdates where orderid = @orderid;

    if @deliveryupdate is null
    begin
        print 'no rider update yet';
        return;
    end

    print 'order status: ' + @statusorder + ', rider update: ' + @deliveryupdate;
end;

exec trackorder 6, 15

--9) Show Ratings of a Specific Restaurant
declare @restaurantId int=1

select * from Ratings where restaurantId = @restaurantId

----///DELIVERY RIDER CONSOLE\\\

--1) View all Orders available for Rider to Choose
select* from orders where deliveryRiderId is null and statusOrder!='delivered' and statusOrder!='cancelled'

--2) Assigning an Order
go
create procedure assignorder
    @riderid int,
    @orderid int
as
begin
    if exists (select 1 from orders where deliveryRiderId = @riderid and statusorder not in ('cancelled', 'delivered'))
    begin
        print 'rider must complete current order before taking a new one';
        return;
    end

    if not exists (select 1 from orders where orderid = @orderid and deliveryRiderId is null and statusorder not in ('cancelled', 'delivered'))
    begin
        print 'order not available for assignment';
        return;
    end

    update orders set deliveryRiderId = @riderid where orderid = @orderid;
    print 'order assigned successfully';
end;

exec assignorder 6, 10


--3) Update Status of the Order
go
create procedure updatedeliverystatus
    @riderid int,@orderid int, @status varchar(50)
as
begin
    if not exists (select 1 from orders where orderid = @orderid and deliveryRiderId = @riderid)
    begin
        print 'order not assigned to this rider';
        return;
    end
    
    update deliveryupdates set status=@status where orderid = @orderid;
    print 'delivery status updated';
end;

exec updatedeliverystatus 1, 1, 'Delivered'

--4) Get Total Earnings
go
declare @riderId int =6
select sum(totalAmount) as earnings
from orders
where deliveryRiderId = @riderid and statusOrder = 'delivered';